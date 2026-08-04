import json
from pathlib import Path

ENTITY_DIR = Path("base44/entities")

ADMIN = {"user_condition": {"role": "admin"}}


def owner_email(field="user_email"):
    return {"$or": [ADMIN, {f"data.{field}": "{{user.email}}"}]}


def owner_id(field):
    return {"$or": [ADMIN, {f"data.{field}": "{{user.id}}"}]}


def all_owner_email(field="user_email", admin_delete=False, admin_update=False):
    owner = owner_email(field)
    return {
        "create": owner,
        "read": owner,
        "update": ADMIN if admin_update else owner,
        "delete": ADMIN if admin_delete else owner,
    }


def admin_only():
    return {"create": ADMIN, "read": ADMIN, "update": ADMIN, "delete": ADMIN}


rules = {
    "Message": all_owner_email(),
    "Transaction": all_owner_email(admin_delete=True, admin_update=True),
    "VirtualNumber": {
        "create": ADMIN,
        "read": {"$or": [ADMIN, {"data.userId": "{{user.id}}"}, {"data.customer_email": "{{user.email}}"}]},
        "update": {"$or": [ADMIN, {"data.userId": "{{user.id}}"}, {"data.customer_email": "{{user.email}}"}]},
        "delete": ADMIN,
    },
    "CallLog": {
        "create": ADMIN,
        "read": {"$or": [ADMIN, {"data.to_owner_id": "{{user.id}}"}, {"data.user_email": "{{user.email}}"}, {"created_by_id": "{{user.id}}"}]},
        "update": {"$or": [ADMIN, {"data.to_owner_id": "{{user.id}}"}, {"data.user_email": "{{user.email}}"}, {"created_by_id": "{{user.id}}"}]},
        "delete": ADMIN,
    },
    "ESim": all_owner_email(admin_delete=True),
    "NumberOrder": all_owner_email(admin_delete=True, admin_update=True),
    "Subscription": {
        "create": ADMIN,
        "read": {"$or": [ADMIN, {"data.user_email": "{{user.email}}"}, {"data.reseller_email": "{{user.email}}"}]},
        "update": ADMIN,
        "delete": ADMIN,
    },
    "SupportTicket": all_owner_email(admin_delete=True),
    "ChatMessage": all_owner_email(admin_delete=True),
    "Voicemail": {
        "create": owner_id("userId"),
        "read": owner_id("userId"),
        "update": owner_id("userId"),
        "delete": owner_id("userId"),
    },
    "UserPreference": all_owner_email(),
    "CallForwardingRule": all_owner_email(),
    "CampaignEnrollment": all_owner_email(admin_delete=True),
    "AndroidSettings": admin_only(),
    "IOSSettings": admin_only(),
    "AppStoreListing": admin_only(),
    "PricingRule": admin_only(),
    "DiscountCode": admin_only(),
    "PPCCampaign": admin_only(),
    "SEOCampaign": admin_only(),
    "SMOCampaign": admin_only(),
}

for entity_name, rls in rules.items():
    path = ENTITY_DIR / f"{entity_name}.jsonc"
    schema = json.loads(path.read_text(encoding="utf-8"))
    if entity_name == "CallLog" and "user_email" not in schema["properties"]:
        ordered = {}
        for key, value in schema["properties"].items():
            ordered[key] = value
            if key == "to_owner_id":
                ordered["user_email"] = {
                    "type": "string",
                    "description": "Email of the user who owns this call record",
                }
        schema["properties"] = ordered
    schema["rls"] = rls
    path.write_text(json.dumps(schema, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"secured {entity_name}")
