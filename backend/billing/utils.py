def account_number_for(seller_profile_id: int) -> str:
    """The number a seller types as the M-Pesa account reference, e.g. NYK-0042."""
    return f"NYK-{seller_profile_id:04d}"
