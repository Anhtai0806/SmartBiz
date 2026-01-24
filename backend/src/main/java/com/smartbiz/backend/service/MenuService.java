package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.*;
import com.smartbiz.backend.entity.*;
import com.smartbiz.backend.exception.ResourceNotFoundException;
import com.smartbiz.backend.exception.UnauthorizedException;
import com.smartbiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    public List<MenuCategoryResponse> getCategoriesByStore(Long storeId) {
        List<MenuCategory> categories = menuCategoryRepository.findByStoreId(storeId);
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new menu category
     * Only owner of the store can create categories
     */
    @Transactional
    public MenuCategoryResponse createCategory(UUID ownerId, MenuCategoryRequest request) {
        // Verify store exists
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + request.getStoreId()));

        // Verify ownership
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create categories for this store");
        }

        MenuCategory category = MenuCategory.builder()
                .store(store)
                .name(request.getName())
                .build();

        MenuCategory saved = menuCategoryRepository.save(category);
        return convertToCategoryResponse(saved);
    }

    /**
     * Update a menu category
     */
    @Transactional
    public MenuCategoryResponse updateCategory(UUID ownerId, Long categoryId, MenuCategoryRequest request) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to update this category");
        }

        category.setName(request.getName());
        MenuCategory updated = menuCategoryRepository.save(category);
        return convertToCategoryResponse(updated);
    }

    /**
     * Delete a menu category
     */
    @Transactional
    public void deleteCategory(UUID ownerId, Long categoryId) {
        MenuCategory category = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this category");
        }

        menuCategoryRepository.delete(category);
    }

    /**
     * Get all menu items for a category
     */
    public List<MenuItemResponse> getItemsByCategory(Long categoryId) {
        List<MenuItem> items = menuItemRepository.findByCategoryId(categoryId);
        return items.stream()
                .map(this::convertToItemResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all menu items for a store
     */
    public List<MenuItemResponse> getItemsByStore(Long storeId) {
        List<MenuItem> items = menuItemRepository.findByCategoryStoreId(storeId);
        return items.stream()
                .map(this::convertToItemResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new menu item
     */
    @Transactional
    public MenuItemResponse createItem(UUID ownerId, MenuItemRequest request) {
        MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        // Verify ownership
        if (!category.getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to create items for this category");
        }

        MenuItem item = MenuItem.builder()
                .category(category)
                .name(request.getName())
                .price(request.getPrice())
                .status(request.getStatus())
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return convertToItemResponse(saved);
    }

    /**
     * Update a menu item
     */
    @Transactional
    public MenuItemResponse updateItem(UUID ownerId, Long itemId, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemId));

        // Verify ownership
        if (!item.getCategory().getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to update this item");
        }

        item.setName(request.getName());
        item.setPrice(request.getPrice());
        item.setStatus(request.getStatus());

        MenuItem updated = menuItemRepository.save(item);
        return convertToItemResponse(updated);
    }

    /**
     * Delete a menu item
     */
    @Transactional
    public void deleteItem(UUID ownerId, Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemId));

        // Verify ownership
        if (!item.getCategory().getStore().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You don't have permission to delete this item");
        }

        menuItemRepository.delete(item);
    }

    /**
     * Convert MenuCategory entity to response DTO
     */
    private MenuCategoryResponse convertToCategoryResponse(MenuCategory category) {
        return MenuCategoryResponse.builder()
                .id(category.getId())
                .storeId(category.getStore().getId())
                .storeName(category.getStore().getName())
                .name(category.getName())
                .itemCount(menuItemRepository.countByCategoryId(category.getId()))
                .build();
    }

    /**
     * Convert MenuItem entity to response DTO
     */
    private MenuItemResponse convertToItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .price(item.getPrice())
                .status(item.getStatus())
                .build();
    }
}
