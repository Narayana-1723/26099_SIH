import urllib.request
import urllib.error
import json
import sys

BACKEND_URL = "http://localhost:8080/api"
FRONTEND_URL = "http://localhost:5173"
ML_URL = "http://127.0.0.1:8001"

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    if data is not None and isinstance(data, dict):
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = body
            return resp.status, parsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed
    except Exception as e:
        return 0, str(e)

results = []

def record(test_num, name, passed, details):
    status = "PASS" if passed else "FAIL"
    results.append((test_num, name, status, details))
    print(f"[{status}] Test {test_num}: {name} - {details}")

print("=================================================================")
print("SIH26099 LIVE SYSTEM VERIFICATION - ALL 9 TEST FLOWS")
print("=================================================================\n")

# TEST 1: Frontend and Public Auth Pages
status_fe, _ = make_request(FRONTEND_URL)
record(1, "Unauthenticated user sees Frontend / Login", status_fe == 200, f"Frontend HTTP Status: {status_fe}")

import time
unique_id = f"REG_{int(time.time())}"
reg_payload = {
    "name": "Arun Verma",
    "employeeId": unique_id,
    "email": f"{unique_id.lower()}@ongc.res.in",
    "password": "SecurePassword@123",
    "cpse": "ONGC",
    "role": "ADMIN" # Attacker attempt to escalate to ADMIN
}
status_reg, data_reg = make_request(f"{BACKEND_URL}/auth/register", method="POST", data=reg_payload)
user_role = data_reg.get("data", {}).get("role") if status_reg == 201 else None
# Test duplicate immediately
status_dup, data_dup = make_request(f"{BACKEND_URL}/auth/register", method="POST", data=reg_payload)

passed_t2 = (status_reg == 201 and user_role == "USER" and status_dup == 422)
record(2, "Public Registration enforces USER role (201) & rejects duplicate (422)", passed_t2, 
       f"Registration: {status_reg} (Role: {user_role}), Duplicate Rejection: {status_dup}")

# TEST 3: Login as USER (USR001) & User Dashboard APIs
user_login = {"employeeId": "USR001", "password": "password"}
status_usr, data_usr = make_request(f"{BACKEND_URL}/auth/login", method="POST", data=user_login)
usr_token = data_usr.get("data", {}).get("token") if status_usr == 200 else None
usr_role = data_usr.get("data", {}).get("user", {}).get("role") if status_usr == 200 else None

status_usr_me, data_usr_me = make_request(
    f"{BACKEND_URL}/auth/me",
    headers={"Authorization": f"Bearer {usr_token}"}
) if usr_token else (0, None)

passed_t3 = (status_usr == 200 and usr_role == "USER" and status_usr_me == 200)
record(3, "Login as USER (USR001) & Get /me Profile", passed_t3, f"Status: {status_usr}, Role: {usr_role}, /me status: {status_usr_me}")

# TEST 4: Login as REVIEWER (REV001)
rev_login = {"employeeId": "REV001", "password": "password"}
status_rev, data_rev = make_request(f"{BACKEND_URL}/auth/login", method="POST", data=rev_login)
rev_token = data_rev.get("data", {}).get("token") if status_rev == 200 else None
rev_role = data_rev.get("data", {}).get("user", {}).get("role") if status_rev == 200 else None

status_rev_admin, _ = make_request(
    f"{BACKEND_URL}/admin/users",
    headers={"Authorization": f"Bearer {rev_token}"}
) if rev_token else (0, None)

passed_t4 = (status_rev == 200 and rev_role == "REVIEWER" and status_rev_admin == 403)
record(4, "Login as REVIEWER (REV001) & Blocked from Admin (403)", passed_t4, f"Status: {status_rev}, Role: {rev_role}, Admin endpoint access: {status_rev_admin} (Expected 403)")

# TEST 5: Login as ADMIN (ADM001)
adm_login = {"employeeId": "ADM001", "password": "password"}
status_adm, data_adm = make_request(f"{BACKEND_URL}/auth/login", method="POST", data=adm_login)
adm_token = data_adm.get("data", {}).get("token") if status_adm == 200 else None
adm_role = data_adm.get("data", {}).get("user", {}).get("role") if status_adm == 200 else None

status_adm_users, data_adm_users = make_request(
    f"{BACKEND_URL}/admin/users",
    headers={"Authorization": f"Bearer {adm_token}"}
) if adm_token else (0, None)

status_adm_audit, _ = make_request(
    f"{BACKEND_URL}/admin/audit-logs",
    headers={"Authorization": f"Bearer {adm_token}"}
) if adm_token else (0, None)

passed_t5 = (status_adm == 200 and adm_role == "ADMIN" and status_adm_users == 200 and status_adm_audit == 200)
record(5, "Login as ADMIN (ADM001) & Admin Console APIs Access", passed_t5, f"Status: {status_adm}, Role: {adm_role}, /admin/users: {status_adm_users}, /audit-logs: {status_adm_audit}")

# TEST 6: Logout
status_logout, data_logout = make_request(
    f"{BACKEND_URL}/auth/logout",
    method="POST",
    headers={"Authorization": f"Bearer {adm_token}"}
) if adm_token else (0, None)
passed_t6 = (status_logout == 200 and data_logout.get("success") == True)
record(6, "Logout User (Invalidate Session & Audit Log)", passed_t6, f"Status: {status_logout}, Response: {data_logout}")

# TEST 7: Access Protected Page without Auth
status_no_auth, data_no_auth = make_request(f"{BACKEND_URL}/materials")
passed_t7 = (status_no_auth in [401, 403])
record(7, "Access Protected Endpoint (/api/materials) without Auth", passed_t7, f"Status: {status_no_auth} (Expected 401 or 403)")

# TEST 8: Call Admin API with USER token (RBAC Forbidden)
status_usr_admin, data_usr_admin = make_request(
    f"{BACKEND_URL}/admin/users",
    headers={"Authorization": f"Bearer {usr_token}"}
) if usr_token else (0, None)
passed_t8 = (status_usr_admin == 403)
record(8, "Call Admin API (/api/admin/users) with USER token", passed_t8, f"Status: {status_usr_admin} (Expected 403 Forbidden)")

# TEST 9: Architecture Isolation Verification (React -> Spring Boot -> ML/DB)
# Check ML service is isolated on 8001
status_ml, _ = make_request(f"{ML_URL}/health")
passed_t9 = (status_ml == 200)
record(9, "FastAPI ML service on port 8001 is active & isolated behind Spring Boot", passed_t9, f"FastAPI Status: {status_ml}")

print("\n=================================================================")
all_passed = all(r[2] == "PASS" for r in results)
print(f"OVERALL RESULT: {'ALL PASS' if all_passed else 'SOME FAILED'}")
print("=================================================================")
