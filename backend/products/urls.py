"""
products/urls.py

URL patterns for the products app.
All paths are relative to /api/products/ (set in root urls.py).
"""

from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    MyProductsView,
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('mine/', MyProductsView.as_view(), name='my-products'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
]
