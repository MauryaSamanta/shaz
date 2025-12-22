from ..models.items_model import Item
from ..models.item_variants_model import ItemVariant

def generate_dummy_variants_and_images():
    sizes = ["S", "M", "L"]

    for item in Item.objects.all():
        # Only create dummy variants if none exist
        if not item.variants.exists():
            for size in sizes:
                ItemVariant.objects.create(
                    item=item,
                    size=size,
                    price=item.price if item.price else 999.0,
                    stock_quant=10,
                )

    print("✅ Dummy variants created successfully.")

generate_dummy_variants_and_images()