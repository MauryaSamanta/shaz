import time
import re
import numpy as np
from ..models.items_model import Item

CACHE_TTL = 300  # 5 minutes

ITEM_CACHE = {
    "items": None,
    "timestamp": 0,
    "count": 0,
}

def is_coord(cat):
    return bool(re.fullmatch(r"co[-\s]?ords?", cat))


def get_all_items_cached():
    global ITEM_CACHE

    # ✅ Return cache if fresh
    if ITEM_CACHE["items"] is not None:
        if time.time() - ITEM_CACHE["timestamp"] < CACHE_TTL:
            return ITEM_CACHE["items"]

    # ✅ Fetch from DB WITH variants prefetch
    items = list(
        Item.objects
        .exclude(embedding=None)
        .prefetch_related('variants')
    )

    # 🔥 PREPROCESS EVERYTHING ONCE
    for item in items:
        # ---- lowercase fields (avoid .lower() in loop later)
        item.gender_l = item.gender.lower() if item.gender else ""
        item.store_l = item.store.lower() if item.store else ""
        item.category_l = item.product_category.lower() if item.product_category else ""

        # ---- coord flag (avoid regex in loop)
        item.is_coord = is_coord(item.category_l) if item.category_l else False

        # ---- numpy embedding (avoid conversion per request)
        if item.embedding:
            item.embedding_np = np.array(item.embedding, dtype=np.float32)
        else:
            item.embedding_np = None

    # ✅ Store in cache
    ITEM_CACHE["items"] = items
    ITEM_CACHE["timestamp"] = time.time()
    ITEM_CACHE["count"] = len(items)

    print(f"🔥 Cache rebuilt with {len(items)} items")

    return items