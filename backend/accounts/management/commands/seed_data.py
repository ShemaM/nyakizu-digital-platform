"""
management/commands/seed_data.py

Usage:
    python manage.py seed_data

Creates:
  - Admin superuser     admin / admin@nyakizu.com / Admin1234!
  - Seller user         hassan / hassan@rngplaza.com / Seller1234!
  - RNG Plaza store     (approved immediately)
  - Sample buyer        fatuma / fatuma@buyer.com / Buyer1234!
  - 8 product categories
  - 15 sample products for the store
"""

import sys
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.utils import timezone
from decimal import Decimal

# Force UTF-8 output so checkmark characters print on Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass


def ok(msg):
    """Return an ASCII-safe success prefix."""
    return f'[OK] {msg}'


def skip(msg):
    """Return an ASCII-safe skip prefix."""
    return f'  -- {msg}'


class Command(BaseCommand):
    help = 'Seed the database with an admin, a store, and sample products'

    def handle(self, *args, **options):
        from accounts.models import CustomUser, SellerProfile, BuyerProfile
        from products.models import Category, Product

        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Nyakizu Seed Data ==='))

        # ── 1. Admin superuser ────────────────────────────────────────────────
        admin, created = CustomUser.objects.get_or_create(
            username='admin',
            defaults={
                'email':             'admin@nyakizu.com',
                'first_name':        'Nyakizu',
                'last_name':         'Admin',
                'role':              'admin',
                'is_staff':          True,
                'is_superuser':      True,
                'is_active':         True,
                'is_email_verified': True,
                'phone_number':      '+254700000000',
            },
        )
        if created:
            admin.set_password('Admin1234!')
            admin.save()
            self.stdout.write(self.style.SUCCESS(ok('Admin created  →  admin / Admin1234!')))
        else:
            self.stdout.write(skip('Admin already exists'))

        # ── 2. Seller user ────────────────────────────────────────────────────
        seller, created = CustomUser.objects.get_or_create(
            username='hassan',
            defaults={
                'email':             'hassan@rngplaza.com',
                'first_name':        'Hassan',
                'last_name':         'Mwangi',
                'role':              'seller',
                'is_active':         True,
                'is_email_verified': True,
                'phone_number':      '+254712345678',
            },
        )
        if created:
            seller.set_password('Seller1234!')
            seller.save()
            self.stdout.write(self.style.SUCCESS(ok('Seller created  →  hassan@rngplaza.com / Seller1234!')))
        else:
            self.stdout.write(skip('Seller already exists'))

        # ── 3. Seller store ───────────────────────────────────────────────────
        store, created = SellerProfile.objects.get_or_create(
            user=seller,
            defaults={
                'store_name':        'RNG Plaza Accessories',
                'store_description': (
                    "Nairobi's most trusted wholesale phone accessories hub. "
                    "We stock tempered glass, cases, chargers, cables, and more "
                    "for all major smartphone brands."
                ),
                'location':   'RNG House, Luthuli Avenue, Nairobi CBD',
                'categories': [
                    'Tempered glass',
                    'Phone cases & covers',
                    'Chargers & adapters',
                    'USB & charging cables',
                    'Batteries & power banks',
                    'Earphones & earbuds',
                    'Memory cards (SD cards)',
                    'Phone repair parts',
                ],
                'approval_status': 'approved',
                'is_verified':     True,
                'approved_at':     timezone.now(),
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(ok('RNG Plaza store created and approved')))
        else:
            if store.approval_status != 'approved':
                store.approve()
                self.stdout.write(self.style.SUCCESS(ok('RNG Plaza store approved')))
            else:
                self.stdout.write(skip('Store already exists and approved'))

        # ── 4. Sample buyer ───────────────────────────────────────────────────
        buyer, created = CustomUser.objects.get_or_create(
            username='fatuma',
            defaults={
                'email':             'fatuma@buyer.com',
                'first_name':        'Fatuma',
                'last_name':         'Kamau',
                'role':              'buyer',
                'is_active':         True,
                'is_email_verified': True,
                'phone_number':      '+254798765432',
            },
        )
        if created:
            buyer.set_password('Buyer1234!')
            buyer.save()
            BuyerProfile.objects.create(
                user=buyer,
                location='Eastleigh, Nairobi',
                business_type='Hawker',
                main_supplier='RNG Plaza Accessories',
            )
            self.stdout.write(self.style.SUCCESS(ok('Buyer created  →  fatuma@buyer.com / Buyer1234!')))
        else:
            self.stdout.write(skip('Buyer already exists'))

        # ── 5. Categories ─────────────────────────────────────────────────────
        category_data = [
            ('Tempered Glass',        'Screen protectors for all phone models'),
            ('Phone Cases & Covers',  'Protective and fashion cases for phones'),
            ('Chargers & Adapters',   'Wall chargers, car chargers, and adapters'),
            ('USB & Charging Cables', 'Type-C, Lightning, and Micro-USB cables'),
            ('Batteries & Power Banks', 'Replacement batteries and portable chargers'),
            ('Earphones & Earbuds',   'Wired and wireless earphones'),
            ('Memory Cards',          'SD cards and flash storage'),
            ('Phone Repair Parts',    'Screens, batteries, and repair tools'),
        ]
        categories = {}
        for name, desc in category_data:
            cat, _ = Category.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name, 'description': desc},
            )
            categories[name] = cat

        self.stdout.write(self.style.SUCCESS(ok(f'{len(categories)} categories ready')))

        # ── 6. Products ───────────────────────────────────────────────────────
        products_data = [
            ('Samsung A54 Tempered Glass',     'Tempered Glass',          150, 120,
             '9H hardness, 2.5D curved edges. Fits Samsung Galaxy A54.'),
            ('iPhone 14 Tempered Glass',        'Tempered Glass',          180,  90,
             'Ultra-clear HD tempered glass for iPhone 14 / 14 Pro.'),
            ('Redmi Note 12 Tempered Glass',    'Tempered Glass',          130,  80,
             'Full-cover tempered glass for Redmi Note 12.'),
            ('Samsung A54 Silicone Case',       'Phone Cases & Covers',    200,  60,
             'Premium soft silicone back cover. Available in 6 colours.'),
            ('iPhone 13 Clear Case',            'Phone Cases & Covers',    250,  50,
             'Transparent hard case with anti-yellow coating.'),
            ('Tecno Spark 20 Flip Cover',       'Phone Cases & Covers',    300,  40,
             'PU leather flip wallet case with card slots.'),
            ('65W GaN USB-C Wall Charger',      'Chargers & Adapters',     850,  35,
             'GaN fast charger. Compatible with Samsung, iPhone, and most USB-C devices.'),
            ('20W iPhone Adapter',              'Chargers & Adapters',     450,  55,
             'Apple-compatible 20W fast charger. USB-C output.'),
            ('Braided USB-C Cable 1m',          'USB & Charging Cables',   120, 200,
             'Nylon braided Type-C cable. Supports 60W fast charging.'),
            ('Lightning Cable 2m',              'USB & Charging Cables',   150, 150,
             '2-metre MFi-compatible Lightning cable. Extra durable.'),
            ('20,000mAh Power Bank',            'Batteries & Power Banks', 1800, 25,
             'Dual USB + USB-C output. LED charge indicator. Airline-safe.'),
            ('Samsung A52 Replacement Battery', 'Batteries & Power Banks',  650, 20,
             '4500mAh genuine-spec replacement battery for Samsung A52.'),
            ('Samsung AKG Type-C Earphones',    'Earphones & Earbuds',     350,  45,
             'Samsung tuned AKG earphones. USB-C connector.'),
            ('Samsung EVO+ 64GB MicroSD',       'Memory Cards',            750,  30,
             'Class 10 / UHS-I microSD card. 100MB/s read speed.'),
            ('iPhone 14 OLED Screen Assembly',  'Phone Repair Parts',     5500,  10,
             'Full OLED digitiser + glass assembly for iPhone 14. OEM quality.'),
        ]

        created_count = 0
        for name, cat_name, price, stock, desc in products_data:
            _, created = Product.objects.get_or_create(
                name=name,
                seller=seller,
                defaults={
                    'category':       categories.get(cat_name),
                    'description':    desc,
                    'price':          Decimal(str(price)),
                    'stock_quantity': stock,
                    'status':         'available',
                },
            )
            if created:
                created_count += 1

        if created_count:
            self.stdout.write(self.style.SUCCESS(ok(f'{created_count} products created')))
        else:
            self.stdout.write(skip('Products already exist'))

        # ── Summary ───────────────────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Done ==='))
        self.stdout.write(
            '\n  Django admin :  http://localhost:8000/admin/'
            '\n  Admin        :  admin / Admin1234!'
            '\n  Seller       :  hassan@rngplaza.com / Seller1234!'
            '\n  Buyer        :  fatuma@buyer.com / Buyer1234!'
            '\n\n  RNG Plaza Accessories is approved with 15 products.\n'
        )
