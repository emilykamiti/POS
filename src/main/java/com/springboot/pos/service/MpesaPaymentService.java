package com.springboot.pos.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.pos.model.Transaction;
import com.springboot.pos.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    private final RestTemplate restTemplate;
    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;

    public MpesaPaymentService(RestTemplate restTemplate, TransactionRepository transactionRepository, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.transactionRepository = transactionRepository;
        this.objectMapper = objectMapper;
    }

    public Transaction initiatePayment(double amount, String phoneNumber, String currency, String transactionDesc) throws Exception {
        try {
            // Step 1: Generate OAuth token
            String accessToken = generateAccessToken();

            // Step 2: Create a Transaction record
            Transaction transaction = new Transaction();
            transaction.setPhoneNumber(phoneNumber);
            transaction.setAmount(amount);
            transaction.setCurrency(currency);
            transaction.setStatus("PENDING");
            transaction.setCreatedAt(LocalDateTime.now());
            transaction = transactionRepository.save(transaction);

            // Step 3: Prepare STK Push request
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String password = Base64.getEncoder().encodeToString((shortcode + passkey + timestamp).getBytes());

            Map<String, Object> stkPushRequest = new HashMap<>();
            stkPushRequest.put("BusinessShortCode", shortcode);
            stkPushRequest.put("Password", password);
            stkPushRequest.put("Timestamp", timestamp);
            stkPushRequest.put("TransactionType", "CustomerPayBillOnline");
            stkPushRequest.put("Amount", String.valueOf((int) amount));
            stkPushRequest.put("PartyA", phoneNumber);
            stkPushRequest.put("PartyB", shortcode);
            stkPushRequest.put("PhoneNumber", phoneNumber);
            stkPushRequest.put("CallBackURL", callbackUrl);
            stkPushRequest.put("AccountReference", "POS Transaction");
            stkPushRequest.put("TransactionDesc", transactionDesc);

            // Log the STK Push request payload
            logger.info("Sending STK Push request with payload: {}", stkPushRequest);

            // Step 4: Send STK Push request
            Map<String, Object> response = sendStkPushRequest(accessToken, stkPushRequest);

            // Step 5: Update Transaction with CheckoutRequestID
            String checkoutRequestId = (String) response.get("CheckoutRequestID");
            if (checkoutRequestId == null) {
                transaction.setStatus("FAILED");
                transaction.setResultDesc("Failed to initiate STK Push: " + response.get("errorMessage"));
                transactionRepository.save(transaction);
                throw new Exception("Failed to initiate STK Push: " + response.get("errorMessage"));
            }

            // Log the CheckoutRequestID
            logger.info("Saving transaction with CheckoutRequestID: {}", checkoutRequestId);

            transaction.setCheckoutRequestId(checkoutRequestId);
            transactionRepository.save(transaction);

            return transaction;
        } catch (Exception e) {
            logger.error("Error in initiatePayment: {}", e.getMessage(), e);
            throw e;
        }
    }

    public boolean confirmPayment(Transaction transaction, int timeoutSeconds) throws InterruptedException {
        long startTime = System.currentTimeMillis();
        while (System.currentTimeMillis() - startTime < timeoutSeconds * 1000) {
            Transaction updatedTransaction = transactionRepository.findById(transaction.getId())
                    .orElseThrow(() -> new IllegalStateException("Transaction not found: " + transaction.getId()));
            if ("SUCCESS".equals(updatedTransaction.getStatus())) {
                return true;
            } else if ("FAILED".equals(updatedTransaction.getStatus())) {
                return false;
            }
            TimeUnit.SECONDS.sleep(5);
        }
        transaction.setStatus("FAILED");
        transaction.setResultDesc("Payment confirmation timed out");
        transactionRepository.save(transaction);
        return false;
    }

    public void handleCallback(Map<String, Object> callbackData) {
        logger.info("Received M-Pesa callback: {}", callbackData);

        try {
            // Validate callback data structure
            if (callbackData == null || !callbackData.containsKey("Body")) {
                logger.error("Invalid callback data: Missing 'Body' key");
                throw new IllegalArgumentException("Invalid callback data: Missing 'Body' key");
            }

            Map<String, Object> body = (Map<String, Object>) callbackData.get("Body");
            if (!body.containsKey("stkCallback")) {
                logger.error("Invalid callback data: Missing 'stkCallback' key");
                throw new IllegalArgumentException("Invalid callback data: Missing 'stkCallback' key");
            }

            Map<String, Object> stkCallback = (Map<String, Object>) body.get("stkCallback");
            String checkoutRequestId = (String) stkCallback.get("CheckoutRequestID");
            if (checkoutRequestId == null) {
                logger.error("Invalid callback data: Missing 'CheckoutRequestID'");
                throw new IllegalArgumentException("Invalid callback data: Missing 'CheckoutRequestID'");
            }

            // Find the transaction
            Transaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId)
                    .orElseThrow(() -> {
                        logger.error("Transaction not found for CheckoutRequestID: {}", checkoutRequestId);
                        return new IllegalStateException("Transaction not found for CheckoutRequestID: " + checkoutRequestId);
                    });

            // Parse result code and description
            String resultCode = String.valueOf(stkCallback.get("ResultCode"));
            String resultDesc = (String) stkCallback.get("ResultDesc");

            if (resultCode == null || resultDesc == null) {
                logger.error("Invalid callback data: Missing 'ResultCode' or 'ResultDesc'");
                throw new IllegalArgumentException("Invalid callback data: Missing 'ResultCode' or 'ResultDesc'");
            }

            // Update transaction
            transaction.setResultCode(resultCode);
            transaction.setResultDesc(resultDesc);
            transaction.setUpdatedAt(LocalDateTime.now());

            if ("0".equals(resultCode)) {
                transaction.setStatus("SUCCESS");
                Map<String, Object> callbackMetadata = (Map<String, Object>) stkCallback.get("CallbackMetadata");
                if (callbackMetadata != null && callbackMetadata.containsKey("Item")) {
                    for (Object item : (List<?>) callbackMetadata.get("Item")) {
                        Map<String, Object> metadataItem = (Map<String, Object>) item;
                        if ("MpesaReceiptNumber".equals(metadataItem.get("Name"))) {
                            transaction.setTransactionId(String.valueOf(metadataItem.get("Value")));
                            break;
                        }
                    }
                } else {
                    logger.warn("CallbackMetadata missing or empty for successful transaction: {}", checkoutRequestId);
                }
            } else {
                transaction.setStatus("FAILED");
            }

            transactionRepository.save(transaction);
            logger.info("Transaction updated: {}", transaction);
        } catch (Exception e) {
            logger.error("Error processing M-Pesa callback: {}", e.getMessage(), e);
            throw e; // Re-throw to let MpesaCallbackController handle the response
        }
    }

    private String generateAccessToken() throws Exception {
        try {
            String url = "live".equals(env) ?
                    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" :
                    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
            String auth = Base64.getEncoder().encodeToString((consumerKey + ":" + consumerSecret).getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + auth);

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                logger.error("Failed to generate M-Pesa access token: Status={}, Response={}", response.getStatusCode(), response.getBody());
                throw new Exception("Failed to generate M-Pesa access token: " + response.getStatusCode());
            }

            return (String) response.getBody().get("access_token");
        } catch (Exception e) {
            logger.error("Error generating M-Pesa access token: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Map<String, Object> sendStkPushRequest(String accessToken, Map<String, Object> requestBody) throws Exception {
        String url = "live".equals(env) ?
                "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest" :
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new Exception("Failed to initiate STK Push: " + response.getStatusCode());
        }
        return response.getBody();
    }
}