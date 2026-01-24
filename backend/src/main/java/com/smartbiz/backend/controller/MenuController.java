package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Menu Management endpoints
 * Accessible by BUSINESS_OWNER for CRUD operations
 * Accessible by STAFF/CASHIER for viewing menu
 */
@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    /**
     * Get all categories for a store
     */
    @GetMapping("/categories/store/{storeId}")
    public ResponseEntity<List<MenuCategoryResponse>> getCategoriesByStore(@PathVariable Long storeId) {
        List<MenuCategoryResponse> categories = menuService.getCategoriesByStore(storeId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Create a new menu category (BUSINESS_OWNER only)
     */
    @PostMapping("/categories")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuCategoryResponse> createCategory(@Valid @RequestBody MenuCategoryRequest request) {
        User currentUser = getCurrentUser();
        MenuCategoryResponse category = menuService.createCategory(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    /**
     * Update a menu category (BUSINESS_OWNER only)
     */
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuCategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody MenuCategoryRequest request) {
        User currentUser = getCurrentUser();
        MenuCategoryResponse category = menuService.updateCategory(currentUser.getId(), id, request);
        return ResponseEntity.ok(category);
    }

    /**
     * Delete a menu category (BUSINESS_OWNER only)
     */
    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        menuService.deleteCategory(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all menu items for a category
     */
    @GetMapping("/items/category/{categoryId}")
    public ResponseEntity<List<MenuItemResponse>> getItemsByCategory(@PathVariable Long categoryId) {
        List<MenuItemResponse> items = menuService.getItemsByCategory(categoryId);
        return ResponseEntity.ok(items);
    }

    /**
     * Get all menu items for a store
     */
    @GetMapping("/items/store/{storeId}")
    public ResponseEntity<List<MenuItemResponse>> getItemsByStore(@PathVariable Long storeId) {
        List<MenuItemResponse> items = menuService.getItemsByStore(storeId);
        return ResponseEntity.ok(items);
    }

    /**
     * Create a new menu item (BUSINESS_OWNER only)
     */
    @PostMapping("/items")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuItemResponse> createItem(@Valid @RequestBody MenuItemRequest request) {
        User currentUser = getCurrentUser();
        MenuItemResponse item = menuService.createItem(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    /**
     * Update a menu item (BUSINESS_OWNER only)
     */
    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MenuItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        User currentUser = getCurrentUser();
        MenuItemResponse item = menuService.updateItem(currentUser.getId(), id, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Delete a menu item (BUSINESS_OWNER only)
     */
    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        menuService.deleteItem(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}
