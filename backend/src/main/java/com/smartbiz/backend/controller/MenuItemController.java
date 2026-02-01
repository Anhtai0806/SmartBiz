package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.MenuItemResponse;
import com.smartbiz.backend.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    /**
     * Get active menu items by store
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('STAFF', 'CASHIER', 'BUSINESS_OWNER')")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByStore(@PathVariable Long storeId) {
        List<MenuItemResponse> menuItems = menuItemService.getMenuItemsByStore(storeId);
        return ResponseEntity.ok(menuItems);
    }
}
