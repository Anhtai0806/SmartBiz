package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.RevenueReportResponse;
import com.smartbiz.backend.dto.StoreComparisonResponse;
import com.smartbiz.backend.dto.TopProductResponse;
import com.smartbiz.backend.repository.InvoiceRepository;
import com.smartbiz.backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

        private final InvoiceRepository invoiceRepository;
        private final OrderItemRepository orderItemRepository;

        public List<RevenueReportResponse> getRevenueReport(UUID ownerId, Long storeId, LocalDateTime start,
                        LocalDateTime end) {
                List<Object[]> results = invoiceRepository.getRevenueReportByOwnerId(ownerId, storeId, start, end);
                return results.stream()
                                .map(row -> RevenueReportResponse.builder()
                                                .date(row[0].toString())
                                                .revenue((BigDecimal) row[1])
                                                .orderCount((Long) row[2])
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<TopProductResponse> getTopProducts(UUID ownerId, Long storeId, LocalDateTime start,
                        LocalDateTime end, int limit) {
                List<Object[]> results = orderItemRepository.getTopProductsByOwnerId(ownerId, storeId, start, end,
                                PageRequest.of(0, limit));
                return results.stream()
                                .map(row -> TopProductResponse.builder()
                                                .id((Long) row[0])
                                                .name((String) row[1])
                                                .quantitySold((Long) row[2])
                                                .revenue((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<StoreComparisonResponse> getStoreComparison(UUID ownerId, LocalDateTime start, LocalDateTime end) {
                List<Object[]> results = invoiceRepository.getStoreComparisonByOwnerId(ownerId, start, end);
                return results.stream()
                                .map(row -> {
                                        BigDecimal revenue = (BigDecimal) row[2];
                                        Long orderCount = (Long) row[3];
                                        BigDecimal avgOrder = orderCount > 0
                                                        ? revenue.divide(BigDecimal.valueOf(orderCount), 2,
                                                                        java.math.RoundingMode.HALF_UP)
                                                        : BigDecimal.ZERO;

                                        return StoreComparisonResponse.builder()
                                                        .storeId((Long) row[0])
                                                        .storeName((String) row[1])
                                                        .revenue(revenue)
                                                        .orderCount(orderCount)
                                                        .averageOrderValue(avgOrder)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }
}
