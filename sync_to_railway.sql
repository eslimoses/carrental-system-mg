-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: car_rental_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` (`id`, `color`, `created_at`, `daily_rate`, `fuel_type`, `insurance_valid_till`, `make`, `mileage`, `model`, `monthly_rate`, `registration_number`, `registration_valid_till`, `seating_capacity`, `status`, `transmission`, `updated_at`, `weekly_rate`, `year`, `admin_id`, `category_id`, `city_id`, `last_maintenance_date`, `next_maintenance_date`, `vehicle_condition`, `insurance_number`, `insurance_expiry_date`, `description`, `maintenance_schedule`, `maintenance_work_required`) VALUES (1,'White','2026-03-23 21:57:37.000000',2600.00,'Petrol','2025-12-31','Toyota',0,'Camry',70000.00,'TN01AA0001','2025-12-31',5,'AVAILABLE','Automatic','2026-03-23 22:36:25.744311',17500.00,2023,1,1,2,'2025-12-10','2026-09-09','Excellent','POL-2574794','2027-06-23',NULL,NULL,NULL),(2,'Silver','2026-03-23 21:57:37.000000',2000.00,'Petrol','2025-12-31','Honda',0,'City',56000.00,'TN01AA0002','2022-02-14',5,'AVAILABLE','Manual','2026-03-23 10:52:00.846988',14000.00,2023,1,1,2,'2026-01-07','2026-03-23','Excellent','POL-2688586','2028-06-13',NULL,NULL,NULL),(3,'Red','2026-03-23 21:57:37.000000',1800.00,'Petrol','2025-12-31','Hyundai',0,'i20',50400.00,'TN01AA0010','2025-12-31',5,'AVAILABLE','Automatic','2026-03-12 22:45:10.742301',12600.00,2023,1,3,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Silver','2026-03-23 21:57:37.000000',3000.00,'Diesel','2025-12-31','Hyundai',0,'Creta',84000.00,'TN01AA0003','2025-12-31',5,'AVAILABLE','Automatic','2026-03-23 10:34:48.714454',21000.00,2023,1,2,3,NULL,NULL,'Excellent','',NULL,NULL,NULL,NULL),(5,'Blue','2026-03-23 21:57:37.000000',1500.00,'Petrol','2025-12-31','Maruti',0,'Swift',42000.00,'TN01AA0004','2025-12-31',5,'AVAILABLE','Manual',NULL,10500.00,2023,1,3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'grey','2026-03-23 21:57:37.000000',9000.00,'Petrol','2025-12-31','Audi',0,'A6',252000.00,'TN01AA0012','2025-12-31',5,'AVAILABLE','Automatic','2026-03-17 15:10:55.280487',63000.00,2023,1,4,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'Black','2026-03-23 21:57:37.000000',8000.00,'Petrol','2025-12-31','Mercedes',0,'E-Class',224000.00,'TN01AA0005','2025-12-31',5,'AVAILABLE','Automatic',NULL,56000.00,2023,1,4,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'White','2026-03-23 21:57:37.000000',5000.00,'Electric','2025-12-31','Tesla',0,'Model 3',140000.00,'TN01AA0006','2025-12-31',5,'AVAILABLE','Automatic',NULL,35000.00,2023,1,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'Blue','2026-03-23 21:57:37.000000',7500.00,'Petrol','2025-12-31','BMW',0,'5 Series',210000.00,'TN01AA0007','2025-12-31',5,'AVAILABLE','Automatic',NULL,52500.00,2023,1,4,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'Oxide with DT','2026-03-23 21:57:37.000000',1600.00,'Electric','2025-12-31','Tata',0,'Nexon EV',78400.00,'MH01EJ7699','2025-12-31',5,'AVAILABLE','Automatic','2026-03-17 15:10:08.589006',19600.00,2023,1,5,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'White','2026-03-23 21:57:37.000000',1000.00,'Petrol','2025-12-31','Maruti',0,'Alto',28000.00,'TN01AA0009','2025-12-31',4,'AVAILABLE','Manual',NULL,7000.00,2023,1,6,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'White','2026-03-23 21:57:37.000000',5500.00,'Diesel','2025-12-31','Toyota',0,'Fortuner',154000.00,'TN01AA0011','2025-12-31',7,'AVAILABLE','Automatic',NULL,38500.00,2023,1,2,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'Blue','2026-03-23 21:57:37.000000',1500.00,'Petrol',NULL,'Tata',100,'Nexon',20000.00,'TN47AQ7705',NULL,5,'AVAILABLE','Automatic','2026-03-17 14:26:14.721811',6000.00,2024,1,3,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` (`id`, `created_at`, `latitude`, `longitude`, `name`, `delivery_fee_per_km`, `state`) VALUES (2,'2026-03-23 21:57:37.000000',13.0827,80.2707,'Chennai',15,'Tamil Nadu'),(3,'2026-03-23 21:57:37.000000',9.9252,78.1198,'Madurai',15,'Tamil Nadu'),(4,'2026-03-23 21:57:37.000000',10.7905,78.7047,'Tirichy',15,'Tamil Nadu'),(5,'2026-03-23 21:57:37.000000',8.0883,77.5385,'Kanyakumari',15,'Tamil Nadu'),(6,'2026-03-23 21:57:37.000000',8.5241,76.9366,'Trivandrum',15,'Kerala'),(7,'2026-03-23 21:57:37.000000',NULL,NULL,'Coimbatore',15,'TamilNadu'),(13,'2026-03-24 00:12:06.764293',NULL,NULL,'tirunelveli',15,'TamilNadu');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `vehicle_categories`
--

LOCK TABLES `vehicle_categories` WRITE;
/*!40000 ALTER TABLE `vehicle_categories` DISABLE KEYS */;
INSERT INTO `vehicle_categories` (`id`, `created_at`, `description`, `name`, `base_rate`, `icon_url`) VALUES (1,'2026-03-12 16:19:02.000000','Comfortable sedan cars for daily commute','Sedan',NULL,NULL),(2,'2026-03-12 16:19:02.000000','Spacious SUVs for family trips','SUV',NULL,NULL),(3,'2026-03-12 16:19:02.000000','Compact hatchback cars','Hatchback',NULL,NULL),(4,'2026-03-12 16:19:02.000000','Premium luxury vehicles','Luxury',NULL,NULL),(5,'2026-03-12 16:19:02.000000','Eco-friendly electric vehicles','Electric',NULL,NULL),(6,'2026-03-12 16:19:02.000000','Small and economical cars','Mini',NULL,NULL);
/*!40000 ALTER TABLE `vehicle_categories` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-28 15:49:54
