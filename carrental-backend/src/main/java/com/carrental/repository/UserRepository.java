package com.carrental.repository;

import com.carrental.entity.User;
import com.carrental.entity.User.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findByRole(UserRole role);
    List<User> findByCityAndRole(String city, UserRole role);
    boolean existsByEmail(String email);
}
