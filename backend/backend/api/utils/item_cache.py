import time

from ..models.items_model import Item

CACHE_TTL = 300  # refresh every 5 minutes (optional)

ITEM_CACHE = {
    "items": None,
    "timestamp": 0,
    "count": 0,
}

def get_all_items_cached():
    global ITEM_CACHE
    # print(ITEM_CACHE)
    # 1. If cache exists and is fresh → return it
    if ITEM_CACHE["items"] is not None:
        # Optional: TTL-based refresh
        if time.time() - ITEM_CACHE["timestamp"] < CACHE_TTL:
            return ITEM_CACHE["items"]

    # 2. Else → fetch once from DB
    items = list(Item.objects.exclude(embedding=None))

    ITEM_CACHE["items"] = items
    ITEM_CACHE["timestamp"] = time.time()
    ITEM_CACHE["count"] = len(items)
    # print(items)
    return items
