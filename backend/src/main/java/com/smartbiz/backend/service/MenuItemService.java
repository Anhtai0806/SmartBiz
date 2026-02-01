package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.MenuItemResponse;
import com.smartbiz.backend.entity.MenuItem;
import com.smartbiz.backend.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    /**
     * Get all active menu items for a store
     */
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItemsByStore(Long storeId) {
        // Find active menu items by store ID
        List<MenuItem> menuItems = menuItemRepository.findActiveByStoreId(storeId);

        return menuItems.stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert MenuItem entity to DTO
     */
    private MenuItemResponse convertEntityToDto(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .categoryId(menuItem.getCategory().getId())
                .categoryName(menuItem.getCategory().getName())
                .name(menuItem.getName())
                .price(menuItem.getPrice())
                .status(menuItem.getStatus())
                .build();
    }
}
