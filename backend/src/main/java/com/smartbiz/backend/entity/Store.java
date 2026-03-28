package com.smartbiz.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stores")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @ToString.Exclude
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "opening_time")
    private java.time.LocalTime openingTime;

    @Column(name = "closing_time")
    private java.time.LocalTime closingTime;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private java.math.BigDecimal taxRate;

    @Column(length = 20)
    private String phone;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<MenuCategory> menuCategories = new ArrayList<>();

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<Tables> tables = new ArrayList<>();

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<StaffShift> staffShifts = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "staff_store", joinColumns = @JoinColumn(name = "store_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    @ToString.Exclude
    private List<User> staffMembers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = true;
        }
    }
}
