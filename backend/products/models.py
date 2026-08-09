"""
products/models.py

Models for the phone accessories product catalog.

Sellers list their products under categories.
Buyers browse and buy from this catalog.
"""

from django.db import models
from accounts.models import CustomUser


class Category(models.Model):
    """
    A product category, e.g. "Phone Cases", "Chargers", "Earphones".
    Products are grouped under categories to make browsing easier.
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # slug is a URL-friendly version of the name, e.g. "phone-cases"
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'categories'   # fix Django's default "Categorys"
        ordering = ['name']


class CategoryAttribute(models.Model):
    """
    A dimension of variation within a category, e.g. Screen Protectors has
    "Phone Model", "Material", and "Function" — each with its own list of
    values (AttributeValue). Lets one category carry several independent
    variant axes instead of a single flat subcategory list.
    """

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='attributes')
    name = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order within the category.")

    class Meta:
        ordering = ['order', 'name']
        unique_together = ('category', 'name')

    def __str__(self):
        return f"{self.category.name} — {self.name}"


class AttributeValue(models.Model):
    """One selectable value for a CategoryAttribute, e.g. "iPhone 13" under "Phone Model"."""

    attribute = models.ForeignKey(CategoryAttribute, on_delete=models.CASCADE, related_name='values')
    value = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order within the attribute.")

    class Meta:
        ordering = ['order', 'value']
        unique_together = ('attribute', 'value')

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class Product(models.Model):
    """
    A single product listing by a seller.

    Each product belongs to one category and is listed by one seller.
    """

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('out_of_stock', 'Out of Stock'),
        ('draft', 'Draft'),          # seller saved but not published yet
    ]

    # Who listed this product — ForeignKey means many products per seller
    seller = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='products',
        limit_choices_to={'role': 'seller'},   # only sellers can have products
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,   # if a category is deleted, keep the product
        null=True,
        blank=True,
        related_name='products',
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # DecimalField is better than FloatField for money — no floating point errors
    price = models.DecimalField(max_digits=10, decimal_places=2)

    stock_quantity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', db_index=True)

    image = models.ImageField(upload_to='products/', null=True, blank=True)

    attribute_values = models.ManyToManyField(
        AttributeValue, blank=True, related_name='products',
        help_text="Variant selections, e.g. Phone Model: iPhone 13, Material: Tempered Glass.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} — {self.seller.username}"

    def is_in_stock(self):
        """Returns True if the product has stock available."""
        return self.stock_quantity > 0

    class Meta:
        ordering = ['-created_at']   # newest products first
