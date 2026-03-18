package com.smartbiz.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

import com.smartbiz.backend.enums.TableStatus;

@Entity
@Table(name = "tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Tables {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @ToString.Exclude
    private Store store;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TableStatus status = TableStatus.EMPTY;

    @OneToMany(mappedBy = "table", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<Order> orders = new ArrayList<>();
}
