package com.springboot.pos.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.pos.model.Sale;
import com.springboot.pos.model.Transaction;
import com.springboot.pos.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class MpesaPaymentService {
    private static final Logger logger = LoggerFactory.getLogger(MpesaPaymentService.class);

    @Value("${mpesa.env}")
    private String env;

    @Value("${mpesa.consumer.key}")
    private String consumerKey;

    @Value("${mpesa.consumer.secret}")
    private String consumerSecret;

    @Value("${mpesa.shortcode}")
    private String shortcode;

    @Value("${mpesa.passkey}")
    private String passkey;

    @Value("${mpesa.callback.url}")
    private String callbackUrl;

    @Value("${mpesa.timeout.seconds:180}")
    private int paymentTimeout;

    private final RestTemplate restTemplate;
    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;

    public MpesaPaymentService(RestTemplate restTemplate,
                               TransactionRepository transactionRepository,
                               ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.transactionRepository = transactionRepository;
        this.objectMapper = objectMapper;
    }


    @Transactional
    public Transaction initiatePayment(double amount, String phoneNumber,
                                       String currency, String transactionDesc,
                                       Sale sale) throws Exception {
        try {
            String accessToken = generateAccessToken();
            Transaction transaction = createTransactionRecord(amount, phoneNumber, currency, sale);
            Map<String, Object> stkPushRequest = prepareStkPushRequest(amount, phoneNumber, transactionDesc);
            Map<String, Object> response = sendStkPushRequest(accessToken, stkPushRequest);
            Transaction updatedTransaction = updateTransactionWithResponse(transaction, response);
            return updatedTransaction;
        } catch (Exception e) {
            throw new Exception("Payment initiation failed: " + e.getMessage());
        }
    }



    public boolean confirmPayment(Transaction transaction, int timeoutSeconds) throws InterruptedException {
        long pollInterval = 5; // seconds
        int maxAttempts = timeoutSeconds / (int) pollInterval;

        for (int i = 0; i < maxAttempts; i++) {
            Transaction updated = transactionRepository.findById(transaction.getId())
                    .orElseThrow(() -> new IllegalStateException("Transaction not found"));

            if ("SUCCESS".equals(updated.getStatus())) {
                logger.info("Payment confirmed for transaction: {}", transaction.getId());
                return true;
            }
            if ("FAILED".equals(updated.getStatus())) {
                return false;
            }

            if (i == maxAttempts - 1) {
                boolean isPaid = checkPaymentStatus(updated.getCheckoutRequestId());
                if (isPaid) {
                    return true;
                }
            }

            TimeUnit.SECONDS.sleep(pollInterval);
        }

        logger.warn("Payment timed out for transaction: {}", transaction.getId());
        transaction.setStatus("TIMEOUT");
        transaction.setResultDesc("Payment confirmation timed out");
        transactionRepository.save(transaction);
        return false;
    }

    //!!!! important - for reconciling pendingTransactions. check date - 9/05/25 commits


    public void handleCallback(Map<String, Object> callbackData) {
        try {
            logger.info("Received callback payload: {}", objectMapper.writeValueAsString(callbackData));

            // 1. Validate callback structure
            validateCallbackStructure(callbackData);

            // 2. Extract callback data
            Map<String, Object> stkCallback = extractCallbackData(callbackData);
            String checkoutRequestId = (String) stkCallback.get("CheckoutRequestID");

            // 3. Find transaction with retries - refactor this part - repeated
            Transaction transaction = null;
            if (transaction == null) {
                logger.warn("No transaction found for CheckoutRequestID: {} after retries", checkoutRequestId);
                return;
            }

            updateTransactionFromCallback(transaction, stkCallback);

            logger.info("Successfully processed callback for transaction: {}", transaction.getId());
        } catch (Exception e) {
            logger.error("Callback failed: {}");
        }
    }
    private Transaction createTransactionRecord(double amount, String phoneNumber,
                                                String currency, Sale sale) {
        Transaction transaction = new Transaction();
        transaction.setPhoneNumber(phoneNumber);
        transaction.setAmount(amount);
        transaction.setCurrency(currency);
        transaction.setStatus("PENDING");
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setSale(sale);
        return transactionRepository.save(transaction);
    }

    private Map<String, Object> prepareStkPushRequest(double amount, String phoneNumber,
                                                      String transactionDesc) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String password = Base64.getEncoder().encodeToString((shortcode + passkey + timestamp).getBytes());

        Map<String, Object> request = new HashMap<>();
        request.put("BusinessShortCode", shortcode);
        request.put("Password", password);
        request.put("Timestamp", timestamp);
        request.put("TransactionType", "CustomerPayBillOnline");
        request.put("Amount", String.valueOf((int) amount));
        request.put("PartyA", phoneNumber);
        request.put("PartyB", shortcode);
        request.put("PhoneNumber", phoneNumber);
        request.put("CallBackURL", callbackUrl);
        request.put("AccountReference", "POS Transaction");
        request.put("TransactionDesc", transactionDesc);

        return request;
    }


    private String generateAccessToken() throws Exception {
        String url = "live".equals(env) ?
                "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" :
                "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

        String auth = Base64.getEncoder().encodeToString((consumerKey + ":" + consumerSecret).getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + auth);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new Exception("Failed to generate access token: " + response.getStatusCode());
        }

        return (String) response.getBody().get("access_token");
    }

    private Map<String, Object> sendStkPushRequest(String accessToken,
                                                   Map<String, Object> requestBody) throws Exception {
        String url = "live".equals(env) ?
                "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest" :
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new Exception("STK Push failed: " + response.getStatusCode());
        }

        return response.getBody();
    }

    private Transaction updateTransactionWithResponse(Transaction transaction,
                                                      Map<String, Object> response) {
        String checkoutRequestId = (String) response.get("CheckoutRequestID");
        if (checkoutRequestId == null) {
            handleFailedInitiation(transaction, response);
        }

        transaction.setCheckoutRequestId(checkoutRequestId);
        return transactionRepository.save(transaction);
    }

    private void handleFailedInitiation(Transaction transaction, Map<String, Object> response) {
        transaction.setStatus("FAILED");
        transaction.setResultDesc("STK Push failed: " + response.get("errorMessage"));
        transactionRepository.save(transaction);
        throw new RuntimeException("STK Push initiation failed");
    }

    private void validateCallbackStructure(Map<String, Object> callbackData) {
        if (callbackData == null || !callbackData.containsKey("Body")) {
            throw new IllegalArgumentException("Invalid callback: Missing Body");
        }

        Map<String, Object> body = (Map<String, Object>) callbackData.get("Body");
        if (!body.containsKey("stkCallback")) {
            throw new IllegalArgumentException("Invalid callback: Missing stkCallback");
        }
    }

    private Map<String, Object> extractCallbackData(Map<String, Object> callbackData) {
        Map<String, Object> body = (Map<String, Object>) callbackData.get("Body");
        Map<String, Object> stkCallback = (Map<String, Object>) body.get("stkCallback");

        if (stkCallback.get("CheckoutRequestID") == null) {
            throw new IllegalArgumentException("Missing CheckoutRequestID");
        }

        return stkCallback;
    }

    private void updateTransactionFromCallback(Transaction transaction,
                                               Map<String, Object> stkCallback) {
        String resultCode = String.valueOf(stkCallback.get("ResultCode"));
        String resultDesc = (String) stkCallback.get("ResultDesc");

        transaction.setResultCode(resultCode);
        transaction.setResultDesc(resultDesc);
        transaction.setUpdatedAt(LocalDateTime.now());

        if ("0".equals(resultCode)) {
            processSuccessfulPayment(transaction, stkCallback);
        } else {
            transaction.setStatus("FAILED");
        }

        transactionRepository.save(transaction);
    }

    private void processSuccessfulPayment(Transaction transaction,
                                          Map<String, Object> stkCallback) {
        transaction.setStatus("SUCCESS");

        Map<String, Object> callbackMetadata = (Map<String, Object>) stkCallback.get("CallbackMetadata");
        if (callbackMetadata != null && callbackMetadata.containsKey("Item")) {
            extractReceiptNumber(transaction, callbackMetadata);
        } else {
            logger.warn("Missing callback metadata for successful transaction");
        }
    }

    private void extractReceiptNumber(Transaction transaction,
                                      Map<String, Object> callbackMetadata) {
        ((List<?>) callbackMetadata.get("Item")).stream()
                .filter(item -> item instanceof Map)
                .map(item -> (Map<?, ?>) item)
                .filter(item -> "MpesaReceiptNumber".equals(item.get("Name")))
                .findFirst()
                .ifPresent(item ->
                        transaction.setTransactionId(String.valueOf(item.get("Value")))
                );
    }

    private boolean checkPaymentStatus(String checkoutRequestId) {
        try {
            String accessToken = generateAccessToken();
            String url = "live".equals(env) ?
                    "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query" :
                    "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String password = Base64.getEncoder().encodeToString((shortcode + passkey + timestamp).getBytes());

            Map<String, Object> request = new HashMap<>();
            request.put("BusinessShortCode", shortcode);
            request.put("Password", password);
            request.put("Timestamp", timestamp);
            request.put("CheckoutRequestID", checkoutRequestId);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String resultCode = String.valueOf(response.getBody().get("ResultCode"));
                String resultDesc = (String) response.getBody().get("ResultDesc");

                Transaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId)
                        .orElse(null);
                if (transaction == null) {
                    logger.warn("No transaction found for status query: {}", checkoutRequestId);
                    return "0".equals(resultCode);
                }

                transaction.setResultCode(resultCode);
                transaction.setResultDesc(resultDesc);
                transaction.setUpdatedAt(LocalDateTime.now());

                if ("0".equals(resultCode)) {
                    transaction.setStatus("SUCCESS");
                    Map<String, Object> callbackMetadata = (Map<String, Object>) response.getBody().get("CallbackMetadata");
                    if (callbackMetadata != null) {
                        extractReceiptNumber(transaction, callbackMetadata);
                    }
                } else {
                    transaction.setStatus("FAILED");
                }
                transactionRepository.save(transaction);
                logger.info("Payment status updated for CheckoutRequestID: {} - Status: {}", checkoutRequestId, transaction.getStatus());
                return "0".equals(resultCode);
            }
        } catch (Exception e) {
            logger.error("Failed to query payment status for CheckoutRequestID: {}", checkoutRequestId, e);
        }
        return false;
    }

}