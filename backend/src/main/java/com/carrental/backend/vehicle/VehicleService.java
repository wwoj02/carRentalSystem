package com.carrental.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "brand",
            "model",
            "type",
            "driveType",
            "pricePerDay",
            "year"
    );

    public List<Vehicle> getVehicles(
            String type,
            String brand,
            String model,
            String driveType,
            Double minPrice,
            Double maxPrice,
            String sortBy,
            String sortDirection
    ) {
        Specification<Vehicle> spec = ((root, query, cb) -> cb.conjunction());
        if (type != null && !type.isBlank()) {
            spec = spec.and(((root, query, cb) ->
                    cb.equal(cb.lower(root.get("type")), type.toLowerCase())));
        }

        if (brand != null && !brand.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
        }

        if (model != null && !model.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("model")), "%" + model.toLowerCase() + "%"));
        }

        if (driveType != null && !driveType.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("driveType")), driveType.toLowerCase()));
        }

        if (minPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("pricePerDay"), minPrice));
        }

        if (maxPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("pricePerDay"), maxPrice));
        }

        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = Sort.by(direction, sortBy);

        return vehicleRepository.findAll(spec, sort);
    }

    public Vehicle getVehicle(Integer id) {
        return vehicleRepository.findById(id)
                .orElseThrow();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }

    public Vehicle updateVehicle(Integer id, Vehicle updatedVehicle) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow();

        vehicle.setBrand(updatedVehicle.getBrand());
        vehicle.setModel(updatedVehicle.getModel());
        vehicle.setYear(updatedVehicle.getYear());
        vehicle.setType(updatedVehicle.getType());
        vehicle.setDriveType(updatedVehicle.getDriveType());
        vehicle.setPricePerDay(updatedVehicle.getPricePerDay());
        vehicle.setAvailable(updatedVehicle.isAvailable());
        vehicle.setDescription(updatedVehicle.getDescription());
        vehicle.setImageUrl(updatedVehicle.getImageUrl());

        return vehicleRepository.save(vehicle);
    }
}