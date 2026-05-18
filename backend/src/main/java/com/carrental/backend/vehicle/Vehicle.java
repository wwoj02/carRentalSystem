package com.carrental.backend.vehicle;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@NoArgsConstructor
@Getter
@Setter
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String brand;
    private String model;
    private int year;

    private String type;
    private String driveType;

    private double pricePerDay;
    private boolean available;
    private String imageUrl;

    @Column(length = 1000)
    private String description;
}
