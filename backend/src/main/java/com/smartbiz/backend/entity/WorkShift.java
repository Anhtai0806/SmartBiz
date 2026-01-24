package com.smartbiz.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/**
 * WorkShift entity represents shift templates (e.g., Morning, Afternoon,
 * Evening)
 * Each store can define their own shift templates with specific time ranges
 */
@Entity
@Table(name = "work_shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Ca sáng", "Ca chiều", "Ca tối"

    @Column(nullable = false)
    private LocalTime startTime; // e.g., 08:00

    @Column(nullable = false)
    private LocalTime endTime; // e.g., 12:00

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
}
