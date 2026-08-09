# Seeds the initial category/attribute/value taxonomy for phone accessories.
# Safe to run more than once (get_or_create) and fully reversible (deletes
# only the rows it created, by name — won't touch categories/attributes an
# admin added later by hand).

from django.db import migrations
from django.utils.text import slugify

TAXONOMY = {
    "Screen Protectors": {
        "Phone Model": [
            "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15",
            "Samsung Galaxy", "Infinix", "Tecno", "Other Android",
        ],
        "Material": ["Tempered Glass", "Hybrid Glass", "PET Film", "Ceramic"],
        "Function": ["Standard Clear", "Privacy", "Anti-Glare", "Blue Light Blocking"],
    },
    "Covers": {
        "Phone Model": [
            "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15",
            "Samsung Galaxy", "Infinix", "Tecno", "Other Android",
        ],
        "Material": ["Silicone", "TPU", "Hard Case", "Leather", "Clear"],
    },
    "Chargers": {
        "Type": ["Wall Charger", "Car Charger", "Wireless Charger", "Power Bank"],
        "Connector": ["USB-C", "Lightning", "Micro-USB"],
        "Output": ["5W", "10W", "20W", "65W+"],
    },
    "BT Speakers/Radios": {
        "Type": ["Bluetooth Speaker", "Radio", "Speaker + Radio Combo"],
        "Power Source": ["Rechargeable Battery", "Plug-in", "Both"],
    },
    "Cables": {
        "Connector Type": ["USB-C", "Lightning", "Micro-USB", "USB-A to USB-C"],
        "Length": ["0.5m", "1m", "2m", "3m"],
    },
}


def seed_taxonomy(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    CategoryAttribute = apps.get_model("products", "CategoryAttribute")
    AttributeValue = apps.get_model("products", "AttributeValue")

    for cat_order, (category_name, attributes) in enumerate(TAXONOMY.items()):
        category, _ = Category.objects.get_or_create(
            name=category_name,
            defaults={"slug": slugify(category_name)},
        )
        for attr_order, (attr_name, values) in enumerate(attributes.items()):
            attribute, _ = CategoryAttribute.objects.get_or_create(
                category=category, name=attr_name, defaults={"order": attr_order},
            )
            for val_order, value in enumerate(values):
                AttributeValue.objects.get_or_create(
                    attribute=attribute, value=value, defaults={"order": val_order},
                )


def unseed_taxonomy(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    CategoryAttribute = apps.get_model("products", "CategoryAttribute")
    AttributeValue = apps.get_model("products", "AttributeValue")

    for category_name, attributes in TAXONOMY.items():
        try:
            category = Category.objects.get(name=category_name)
        except Category.DoesNotExist:
            continue
        for attr_name, values in attributes.items():
            try:
                attribute = CategoryAttribute.objects.get(category=category, name=attr_name)
            except CategoryAttribute.DoesNotExist:
                continue
            AttributeValue.objects.filter(attribute=attribute, value__in=values).delete()
            if not attribute.values.exists():
                attribute.delete()
        if not category.attributes.exists() and not category.products.exists():
            category.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0003_attributevalue_product_attribute_values_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_taxonomy, unseed_taxonomy),
    ]
