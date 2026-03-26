package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final StoreRepository storeRepository;

    /**
     * Get all categories for a store
     */
    public List<MenuCategoryResponse> getCategoriesByStore(@NonNull Long storeId) {
        List<MenuCategory> categories = menuCategoryRepository.findByStoreId(requireValue(storeId, "storeId"));
        return categories.stream()
                .map(category -> convertToCategoryResponse(requireValue(category, "category")))
                .collect(Collectors.toList());
    }

    /**
     * Create a new menu category
     * Only owner of the store can create categories
     */
    @Transactional
    public MenuCategoryResponse createCategory(@NonNull UUID ownerId, @NonNull MenuCategoryRequest request) {
        // Verify store exists
        Long storeId = requireValue(request.getStoreId(), "storeId");
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create categories for this store");
        }

        MenuCategory category = requireValue(MenuCategory.builder()
                .store(store)
                .name(request.getName())
                .build(), "category");

        MenuCategory saved = menuCategoryRepository.save(requireValue(category, "category"));
        return convertToCategoryResponse(requireValue(saved, "savedCategory"));
    }

    /**
     * Update a menu category
     */
    @Transactional
    public MenuCategoryResponse updateCategory(@NonNull UUID ownerId, @NonNull Long categoryId,
            @NonNull MenuCategoryRequest request) {
        MenuCategory category = menuCategoryRepository.findById(requireValue(categoryId, "categoryId"))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to update this category");
        }

        category.setName(request.getName());
        MenuCategory updated = menuCategoryRepository.save(requireValue(category, "category"));
        return convertToCategoryResponse(requireValue(updated, "updatedCategory"));
    }

    /**
     * Delete a menu category
     */
    @Transactional
    public void deleteCategory(@NonNull UUID ownerId, @NonNull Long categoryId) {
        MenuCategory category = menuCategoryRepository.findById(requireValue(categoryId, "categoryId"))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this category");
        }

        menuCategoryRepository.delete(requireValue(category, "category"));
    }

    /**
     * Get all menu items for a category
     */
    public List<MenuItemResponse> getItemsByCategory(@NonNull Long categoryId) {
        List<MenuItem> items = menuItemRepository.findByCategoryId(requireValue(categoryId, "categoryId"));
        return items.stream()
                .map(item -> convertToItemResponse(requireValue(item, "item")))
                .collect(Collectors.toList());
    }

    /**
     * Get all menu items for a store
     */
    public List<MenuItemResponse> getItemsByStore(@NonNull Long storeId) {
        List<MenuItem> items = menuItemRepository.findByCategoryStoreId(requireValue(storeId, "storeId"));
        return items.stream()
                .map(item -> convertToItemResponse(requireValue(item, "item")))
                .collect(Collectors.toList());
    }

    /**
     * Create a new menu item
     */
    @Transactional
    public MenuItemResponse createItem(@NonNull UUID ownerId, @NonNull MenuItemRequest request) {
        Long categoryId = requireValue(request.getCategoryId(), "categoryId");
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create items for this category");
        }

        MenuItem item = requireValue(MenuItem.builder()
                .category(category)
                .name(request.getName())
                .price(request.getPrice())
                .status(request.getStatus())
                .build(), "item");

        MenuItem saved = menuItemRepository.save(requireValue(item, "item"));
        return convertToItemResponse(requireValue(saved, "savedItem"));
    }

    /**
     * Update a menu item
     */
    @Transactional
    public MenuItemResponse updateItem(@NonNull UUID ownerId, @NonNull Long itemId, @NonNull MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(requireValue(itemId, "itemId"))
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemId));

        // Verify ownership
        if (!item.getCategory().getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to update this item");
        }

        item.setName(request.getName());
        item.setPrice(request.getPrice());
        item.setStatus(request.getStatus());

        MenuItem updated = menuItemRepository.save(requireValue(item, "item"));
        return convertToItemResponse(requireValue(updated, "updatedItem"));
    }

    /**
     * Delete a menu item
     */
    @Transactional
    public void deleteItem(@NonNull UUID ownerId, @NonNull Long itemId) {
        MenuItem item = menuItemRepository.findById(requireValue(itemId, "itemId"))
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemId));

        // Verify ownership
        if (!item.getCategory().getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this item");
        }

        menuItemRepository.delete(requireValue(item, "item"));
    }

    /**
     * Convert MenuCategory entity to response DTO
     */
    private MenuCategoryResponse convertToCategoryResponse(@NonNull MenuCategory category) {
        Long categoryId = requireValue(category.getId(), "categoryId");
        return MenuCategoryResponse.builder()
                .id(categoryId)
                .storeId(category.getStore().getId())
                .storeName(category.getStore().getName())
                .name(category.getName())
                .itemCount(menuItemRepository.countByCategoryId(categoryId))
                .build();
    }

    /**
     * Convert MenuItem entity to response DTO
     */
    private MenuItemResponse convertToItemResponse(@NonNull MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .price(item.getPrice())
                .status(item.getStatus())
                .build();
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
