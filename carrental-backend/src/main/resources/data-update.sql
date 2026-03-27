-- Update vehicle photos with working image URLs
UPDATE vehicle_photos SET photo_url = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400' WHERE vehicle_id = 1 AND photo_type = 'EXTERIOR';
UPDATE vehicle_photos SET photo_url = 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400' WHERE vehicle_id = 2 AND photo_type = 'EXTERIOR';
UPDATE vehicle_photos SET photo_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400' WHERE vehicle_id = 3 AND photo_type = 'EXTERIOR';
UPDATE vehicle_photos SET photo_url = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400' WHERE vehicle_id = 4 AND photo_type = 'EXTERIOR';
