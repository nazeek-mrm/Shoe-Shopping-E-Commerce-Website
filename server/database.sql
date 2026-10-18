-- ============================================================
--  SHOE MART — database schema + sample data
--  Import this file in phpMyAdmin (Import tab) or run:
--  mysql -u root -p < database.sql
-- ============================================================

DROP DATABASE IF EXISTS shoemart;
CREATE DATABASE shoemart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shoemart;

-- ------------------------------------------------------------
--  Brands
-- ------------------------------------------------------------
CREATE TABLE brands (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50)  NOT NULL UNIQUE,
  slug  VARCHAR(50)  NOT NULL UNIQUE,
  logo  VARCHAR(255) NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  Products (Shoes)
-- ------------------------------------------------------------
CREATE TABLE products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  brand_id       INT NOT NULL,
  model          VARCHAR(120) NOT NULL,
  slug           VARCHAR(160) NOT NULL UNIQUE,
  price          DECIMAL(10,2) NOT NULL,
  old_price      DECIMAL(10,2) NULL,              -- filled in = product is on offer
  material       VARCHAR(120),                    -- upper material e.g. "Full-grain leather"
  closure        VARCHAR(60),                     -- e.g. "Lace-up", "Slip-on", "Velcro"
  sole           VARCHAR(80),                     -- sole material e.g. "Rubber", "EVA foam"
  heel_height    VARCHAR(50),                     -- e.g. "Flat", "2-inch block heel"
  toe_shape      VARCHAR(60),                     -- e.g. "Round toe", "Pointed", "Square toe"
  gender         ENUM('men','women','unisex','kids') NOT NULL DEFAULT 'unisex',
  insole         VARCHAR(100),                    -- e.g. "Memory foam insole"
  weight         VARCHAR(30),                     -- e.g. "320g per shoe"
  available_sizes VARCHAR(200),                   -- e.g. "UK 6, 7, 8, 9, 10, 11"
  warranty       VARCHAR(60)  DEFAULT '6 months warranty',
  condition_type ENUM('new','used') NOT NULL DEFAULT 'new',
  use_case       ENUM('casual','sport','formal','outdoor') NULL,
  stock          INT NOT NULL DEFAULT 0,
  is_featured    TINYINT(1) NOT NULL DEFAULT 0,
  is_fast_moving TINYINT(1) NOT NULL DEFAULT 0,
  description    TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
  INDEX idx_price (price),
  INDEX idx_usecase (use_case)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  Product images (a shoe has several photos)
-- ------------------------------------------------------------
CREATE TABLE product_images (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  Orders
-- ------------------------------------------------------------
CREATE TABLE orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  order_code     VARCHAR(20) NOT NULL UNIQUE,
  customer_name  VARCHAR(100) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  email          VARCHAR(100),
  address        TEXT         NOT NULL,
  city           VARCHAR(60),
  payment_method ENUM('cod','bank') NOT NULL DEFAULT 'cod',
  note           TEXT,
  total          DECIMAL(12,2) NOT NULL,
  status         ENUM('pending','confirmed','delivered','cancelled') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT NULL,
  model      VARCHAR(160) NOT NULL,      -- copied so old orders survive product edits
  unit_price DECIMAL(10,2) NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id)
    REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  Customer messages
-- ------------------------------------------------------------
CREATE TABLE inquiries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  email         VARCHAR(100),
  message       TEXT NOT NULL,
  status        ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inq_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  Admin login
-- ------------------------------------------------------------
CREATE TABLE admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  email         VARCHAR(120) NOT NULL DEFAULT 'nazeeknzk@gmail.com',
  full_name     VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE password_resets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(120) NOT NULL,
  otp        VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE admin_tokens (
  token      CHAR(64) PRIMARY KEY,
  admin_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_token_admin FOREIGN KEY (admin_id)
    REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  Sample data
-- ============================================================
INSERT INTO brands (name, slug) VALUES
 ('Nike','nike'), ('Adidas','adidas'), ('Puma','puma'), ('Reebok','reebok'),
 ('New Balance','new-balance'), ('Vans','vans'), ('Converse','converse');

INSERT INTO products
 (brand_id, model, slug, price, old_price, material, closure, sole, heel_height, toe_shape,
  gender, insole, weight, available_sizes, condition_type, use_case, stock, is_featured, is_fast_moving, description)
VALUES
 -- Nike
 (1,'Air Max 270','nike-air-max-270', 28500, 33000,
  'Breathable mesh upper with synthetic overlays','Lace-up','Rubber with Max Air unit','38mm Air heel unit','Round toe',
  'men','Foam midsole with Max Air cushioning','310g per shoe','UK 6, 7, 8, 9, 10, 11, 12','new','sport',8,1,1,
  'The Nike Air Max 270 delivers a full day of comfort with the tallest Air unit yet in a lifestyle shoe. Lightweight, breathable and instantly recognisable.'),

 (1,'Revolution 7','nike-revolution-7', 12500, NULL,
  'Breathable mesh upper','Lace-up','Foam rubber sole','Flat','Round toe',
  'unisex','Padded foam insole','270g per shoe','UK 3, 4, 5, 6, 7, 8, 9, 10, 11','new','sport',12,0,1,
  'A lightweight everyday running shoe with a foam midsole that delivers all-day cushioning at an affordable price.'),

 -- Adidas
 (2,'Ultraboost 22','adidas-ultraboost-22', 42000, 48000,
  'Primeknit+ textile upper','Lace-up','Continental rubber outsole','Boost midsole','Round toe',
  'women','Full-length Boost midsole','295g per shoe','UK 3, 4, 5, 6, 7, 8','new','sport',5,1,0,
  'Energy-returning Boost technology in every step. The Primeknit upper wraps your foot perfectly and the Continental rubber grip holds in wet conditions.'),

 (2,'Stan Smith','adidas-stan-smith', 16500, NULL,
  'Full-grain leather upper','Lace-up','Rubber cup sole','Flat','Round toe',
  'unisex','Ortholite® sock liner','240g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11, 12','new','casual',10,0,1,
  'The timeless icon. Clean leather, three stripes on the side and a perforated Stan Smith face on the tongue. Goes with everything.'),

 -- Puma
 (3,'Suede Classic XXI','puma-suede-classic-xxi', 14000, 17500,
  'Suede leather upper','Lace-up','Rubber sole','Flat','Round toe',
  'unisex','Padded insole','230g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11','new','casual',7,1,1,
  'The Puma Suede has been on the streets since 1968. This classic silhouette in premium suede remains one of the best casual shoes money can buy.'),

 (3,'Velocity Nitro 2','puma-velocity-nitro-2', 22000, NULL,
  'Engineered mesh upper','Lace-up','PUMAGRIP rubber outsole','Nitro foam midsole','Round toe',
  'men','NITRO foam footbed','285g per shoe','UK 6, 7, 8, 9, 10, 11, 12','new','sport',4,0,0,
  'Explosive speed with NITRO foam technology for exceptional energy return. Built for runners who want a fast, responsive daily trainer.'),

 -- Reebok
 (4,'Classic Leather','reebok-classic-leather', 13500, NULL,
  'Full-grain leather upper','Lace-up','Rubber outsole','Low heel','Round toe',
  'women','Die-cut EVA midsole','220g per shoe','UK 3, 4, 5, 6, 7, 8, 9','new','casual',9,0,1,
  'A soft leather upper and a clean silhouette that has been in rotation since 1983. The padded foam collar gives a comfortable fit from the first wear.'),

 (4,'Nano X3','reebok-nano-x3', 25500, 29000,
  'Flexweave knit upper','Lace-up','Carbon rubber outsole','Flat','Round toe',
  'unisex','Floatride Energy Foam midsole','330g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11','new','sport',6,0,1,
  'Built for functional fitness. Stable enough for heavy lifts, flexible enough for cardio, and cushioned enough for the treadmill.'),

 -- New Balance
 (5,'574 Core','new-balance-574-core', 19500, 22000,
  'Suede and mesh upper','Lace-up','ENCAP midsole technology rubber sole','Low heel','Round toe',
  'unisex','Ortholite insole','280g per shoe','UK 5, 6, 7, 8, 9, 10, 11, 12','new','casual',8,1,1,
  'The 574 defines the New Balance look. ENCAP technology in the midsole gives you support and cushioning built to last through years of daily wear.'),

 -- Vans
 (6,'Old Skool','vans-old-skool', 11000, NULL,
  'Canvas and suede upper','Lace-up','Waffle rubber sole','Flat','Round toe',
  'unisex','Padded tongue and collar','220g per shoe','UK 3, 4, 5, 6, 7, 8, 9, 10, 11, 12','new','casual',15,0,1,
  'The original skate shoe with the iconic jazz stripe. Tough waffle sole, padded collar and a low-cut silhouette that works from the skate park to the street.'),

 -- Converse
 (7,'Chuck Taylor All Star Hi','converse-chuck-taylor-all-star-hi', 9500, 11000,
  'Canvas upper with rubber toe cap','Lace-up','Non-slip rubber sole','Flat','Round toe',
  'unisex','OrthoLite cushioned insole','250g per shoe','UK 3, 4, 5, 6, 7, 8, 9, 10, 11, 12','new','casual',18,1,1,
  'The Chuck Taylor High Top is an icon worn by everyone from basketball players to rock stars. Simple canvas, rubber sole and a timeless ankle silhouette.'),

 (4,'Club C 85','reebok-club-c-85', 12000, NULL,
  'Leather upper','Lace-up','Rubber outsole','Low heel','Round toe',
  'women','Die-cut EVA midsole','215g per shoe','UK 3, 4, 5, 6, 7, 8','used','casual',3,0,0,
  'Ex-display pair in excellent condition. The Club C 85 is clean, minimal and goes with any outfit. Tested and cleaned before listing.'),

 -- Nike additions
 (1,'Air Force 1 ''07','nike-air-force-1-07', 31500, 36000,
  'Premium crisp leather upper with stitched overlays','Lace-up','Non-marking pivot-circle rubber cupsole','32mm encapsulated Air','Round toe with perforations',
  'unisex','Nike Air cushioned footbed','390g per shoe','UK 6, 7, 8, 9, 10, 11, 12','new','casual',14,1,1,
  'The radiance lives on with the b-ball original. The Air Force 1 07 blends hardwood comfort with off-court flair for an iconic street style.'),

 (1,'Air Zoom Pegasus 40','nike-air-zoom-pegasus-40', 26000, NULL,
  'Engineered single-layer mesh upper','Lace-up','Waffle-inspired rubber outsole with flex grooves','10mm drop heel stack','Round toe',
  'men','Dual Zoom Air units with React foam','288g per shoe','UK 7, 8, 9, 10, 11','new','sport',10,0,1,
  'A springy ride for every run. The Pegasus 40 returns with enhanced midfoot fit and responsive React foam for daily road miles.'),

 (1,'Dunk Low Retro','nike-dunk-low-retro', 29000, 34500,
  'Smooth two-tone leather upper','Lace-up','Heritage court rubber outsole','Flat','Perforated round toe',
  'unisex','Padded low-cut collar foam bed','340g per shoe','UK 5, 6, 7, 8, 9, 10, 11','new','casual',6,1,1,
  'Created for the hardwood but taken to the streets, the 80s b-ball icon returns with classic collegiate colorways and crisp leather.'),

 (1,'Blazer Mid ''77 Vintage','nike-blazer-mid-77-vintage', 24500, NULL,
  'Leather and synthetic upper with suede details','Lace-up','Solid rubber outsole with herringbone pattern','Flat','Round toe',
  'unisex','Autoclave cushioned sockliner','360g per shoe','UK 6, 7, 8, 9, 10, 11','new','casual',9,0,0,
  'Vintage basketball style meets street-ready comfort. The Blazer Mid 77 features an exposed foam tongue and retro treatment.'),

 -- Adidas additions
 (2,'Samba OG','adidas-samba-og', 27500, 32000,
  'Soft full-grain leather with suede T-toe overlay','Lace-up','Low-profile gum rubber outsole','Flat','Suede T-toe',
  'unisex','Textile lining with die-cut EVA','310g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11','new','casual',15,1,1,
  'Born on the pitch, the Samba is a timeless icon of street style. Features the legendary gum sole, serrated 3-Stripes and gold foil lettering.'),

 (2,'Gazelle','adidas-gazelle', 22000, NULL,
  'Supple pigskin suede upper','Lace-up','Textured rubber cupsole','Flat','Round toe',
  'unisex','Trefoil branded OrthoLite sockliner','280g per shoe','UK 4, 5, 6, 7, 8, 9, 10','new','casual',11,0,1,
  'A faithful reissue of the 1991 Gazelle, matching the vintage textures and materials with contrasting white 3-Stripes and heel tab.'),

 (2,'NMD_R1','adidas-nmd-r1', 34000, 39000,
  'Stretchy knit mesh upper','Lace-up','Rubber outsole with signature EVA midsole plugs','Boost stack heel','Round toe',
  'men','Responsive Boost midsole cushioning','290g per shoe','UK 7, 8, 9, 10, 11, 12','new','sport',8,0,1,
  'Packs futuristic tech into a street-ready silhouette. Features energy-returning Boost cushioning and signature moulded midsole plugs.'),

 (2,'Forum Low','adidas-forum-low', 25000, NULL,
  'Layered leather and coated leather upper','Lace-up with removable ankle strap','Chunky rubber cupsole with pivot circle','Flat','Perforated round toe',
  'unisex','Padded terry lining and foam insole','370g per shoe','UK 6, 7, 8, 9, 10, 11','new','casual',7,0,0,
  'More than just a basketball shoe, the Forum Low is an attitude. Features the signature X-strap ankle design and premium 80s court DNA.'),

 -- Puma additions
 (3,'RS-X Reinvention','puma-rs-x-reinvention', 26500, 31000,
  'Mesh upper with suede and synthetic leather overlays','Lace-up','Sculpted lightweight PU midsole with rubber outsole','Elevated chunky heel','Round toe',
  'unisex','Running System (RS) cushioned technology','380g per shoe','UK 6, 7, 8, 9, 10, 11','new','casual',9,1,1,
  'Extreme chunky retro design powered by PUMAs 80s Running System cushioning. Bold, dynamic lines with unmatched streetwear presence.'),

 (3,'Future Rider Play On','puma-future-rider-play-on', 18500, NULL,
  'Nylon ripstop with suede and leather overlays','Lace-up','Slim Federbein shock-absorbing studded rubber outsole','Flat','Round toe',
  'unisex','Rider Foam shock-absorbing insole','260g per shoe','UK 5, 6, 7, 8, 9, 10, 11','new','casual',12,0,1,
  'Born in 1980 as the Fast Rider and reborn with vibrant color-blocking, lightweight nylon and super-cushioned Rider Foam.'),

 (3,'Cali Star','puma-cali-star', 19500, 23000,
  'Premium leather upper with clean perforated vamp','Lace-up','Stacked rubber platform midsole','Low platform','Round toe',
  'women','Moulded PU comfort sockliner','320g per shoe','UK 3, 4, 5, 6, 7, 8','new','casual',10,0,0,
  'Laid-back West Coast vibes inspired by the 80s classic. Sleek silhouette with metallic accents and a chunky platform sole.'),

 -- Reebok additions
 (4,'Zig Kinetica 2.5','reebok-zig-kinetica-2-5', 28000, 33500,
  'Seamless mesh upper with engineered support zones','Lace-up','Zig Energy Band outsole with Floatride Fuel core','Angled kinetic heel','Round toe',
  'men','Floatride Fuel high-rebound insole','340g per shoe','UK 7, 8, 9, 10, 11','new','sport',7,1,0,
  'Futuristic innovation in motion. The zig-zag energy shell channels kinetic return with every stride while Floatride Fuel delivers cloud-like bounce.'),

 (4,'Floatride Energy 5','reebok-floatride-energy-5', 21500, NULL,
  'Speed Shift jacquard mesh upper','Lace-up','Full rubber high-abrasion traction outsole','Neutral running drop','Round toe',
  'unisex','Floatride Energy Foam midsole','255g per shoe','UK 5, 6, 7, 8, 9, 10, 11','new','sport',11,0,1,
  'The daily running trainer that punches above its weight class. Light, responsive, and durable enough for tempo workouts and long recovery miles.'),

 -- New Balance additions
 (5,'550 Vintage Basketball','new-balance-550', 32000, 37000,
  'Premium leather, suede and mesh construction','Lace-up','Non-marking basketball rubber cupsole','Flat','Perforated round toe',
  'unisex','Cushioned OrthoLite athletic insole','395g per shoe','UK 6, 7, 8, 9, 10, 11, 12','new','casual',12,1,1,
  'A tribute to 90s pro ballers and the streetwear that defined a generation. Clean lines, puff N logo, and authentic vintage basketball proportions.'),

 (5,'990v5 Heritage','new-balance-990v5', 52000, 58000,
  'Pigskin suede and breathable mesh upper','Lace-up','Ndurance rubber outsole with ENCAP midsole','Cushioned heel counter','Round toe',
  'unisex','Dual-density collar foam and Ortholite footbed','385g per shoe','UK 7, 8, 9, 10, 11, 12','new','casual',5,1,0,
  'The pinnacle of craftsmanship and understated style. Celebrated worldwide by runners and fashion pioneers alike for supreme all-day comfort.'),

 (5,'327 Lifestyle','new-balance-327', 23500, 27000,
  'Lightweight split suede and nylon upper','Lace-up','Trail-inspired studded rubber wrap outsole','Flared wedge heel','Tapered round toe',
  'women','Die-cut EVA comfort cushioning','270g per shoe','UK 3, 4, 5, 6, 7, 8','new','casual',14,0,1,
  'Boldly revamping 1970s heritage running shoes. Highlights an oversized asymmetric N logo and an exaggerated lugged trail sole extending up the heel.'),

 (5,'2002R Protection','new-balance-2002r', 36000, NULL,
  'Suede leather overlays with diamond knit mesh','Lace-up','N-ergy shock absorption with Stability Web','ABZORB heel cushioning','Round toe',
  'men','ABZORB and N-ergy technology footbed','360g per shoe','UK 7, 8, 9, 10, 11','new','casual',8,0,1,
  'Technical running heritage translated into contemporary luxury streetwear. Equipped with premium ABZORB SBS heel cushioning and N-ergy tech.'),

 -- Vans additions
 (6,'Sk8-Hi','vans-sk8-hi', 15500, 18000,
  'Durable canvas and suede upper with re-enforced toe caps','Lace-up','Signature rubber waffle outsole','Padded high collar','Round toe',
  'unisex','Padded supportive collar lining','360g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11','new','casual',13,1,1,
  'The legendary high-top lace-up inspired by the Old Skool. Features sturdy suede uppers, supportive padded collars, and signature rubber waffle outsoles.'),

 (6,'Classic Slip-On','vans-classic-slip-on', 12500, NULL,
  'Sturdy canvas upper with elastic side accents','Slip-on','Vulcanized gum rubber waffle sole','Flat','Round toe',
  'unisex','Cushioned footbed','270g per shoe','UK 3, 4, 5, 6, 7, 8, 9, 10, 11','new','casual',16,0,1,
  'No laces, no fuss. Introduced in 1977, the Classic Slip-On instantly became an emblem of pop culture, skateboarding, and everyday ease.'),

 (6,'Authentic Deck','vans-authentic-deck', 11500, NULL,
  'Classic 10oz canvas upper','Lace-up','Signature gum waffle rubber outsole','Flat','Clean round toe',
  'unisex','Comfort-lined insole','250g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11','new','casual',18,0,0,
  'The original 1966 shoe that started it all. Simple low-top silhouette with sturdy canvas and metal eyelets that has stood the test of time.'),

 (6,'Era Pro','vans-era-pro', 13000, 15000,
  'Double-stitched canvas upper with padded ankle collar','Lace-up','Original waffle rubber outsole','Flat','Round toe',
  'unisex','Cushioned collar and footbed','275g per shoe','UK 5, 6, 7, 8, 9, 10, 11','new','casual',11,0,0,
  'Designed by skaters Tony Alva and Stacy Peralta in 1976. The Era took the Authentic and upgraded it with ankle padding for board control.'),

 -- Converse additions
 (7,'Chuck 70 Vintage Canvas','converse-chuck-70-vintage-canvas', 16500, 19500,
  'Heavyweight 12oz vintage canvas with archival stitching','Lace-up','Glossy egret rubber midsole with diamond outsole','Flat','Rubber toe cap',
  'unisex','Enhanced OrthoLite cushioning with arch support','310g per shoe','UK 4, 5, 6, 7, 8, 9, 10, 11, 12','new','casual',15,1,1,
  'The elevated version of the timeless classic. Built on the original 1970s design with thicker canvas, winged tongue stitching, and all-day comfort cushioning.'),

 (7,'One Star Pro','converse-one-star-pro', 17000, NULL,
  'Premium vintage hairy suede upper','Lace-up','CONS traction rubber outsole','Flat','Round toe',
  'unisex','CX foam sockliner for impact cushioning','290g per shoe','UK 5, 6, 7, 8, 9, 10, 11','new','casual',9,0,0,
  'Re-engineered for skate and street culture with rugged suede, die-cut star cutout, and CX foam cushioning to absorb heavy impacts.'),

 (7,'Run Star Hike Platform','converse-run-star-hike-platform', 24000, 28500,
  'Iconic canvas upper with star ankle patch','Lace-up','Two-tone jagged exaggerated rubber lug sole','Platform','Round toe',
  'women','SmartFOAM sockliner for comfort','420g per shoe','UK 3, 4, 5, 6, 7, 8','new','casual',8,1,1,
  'A futuristic re-imagining of the Chuck Taylor. Chunky platform and jagged two-tone sawtooth rubber sole give everyday looks an unexpected edge.');

-- one placeholder image row per product (replace paths from the admin panel)
INSERT INTO product_images (product_id, image_path, is_primary)
SELECT id, CONCAT('uploads/sample-', id, '.jpg'), 1 FROM products;

-- ========================================
-- Admin Account Configuration
-- ========================================

-- Admin accounts must be created securely
-- after database installation.
-- Never store default passwords or
-- real admin password hashes in this file.
