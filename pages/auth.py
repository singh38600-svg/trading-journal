"""
Fyers Auth Helper - Run this page to generate your daily access token.
Fyers tokens expire every day at ~midnight, so you'll re-auth each morning.
"""
import streamlit as st
from fyers_apiv3 import fyersModel
import os

st.set_page_config(page_title="Fyers Auth", page_icon="🔑", layout="centered")

st.title("🔑 Fyers Auth")
st.caption("Generate your daily access token")

APP_ID = st.secrets.get("FYERS_APP_ID", os.getenv("FYERS_APP_ID", ""))
SECRET = st.secrets.get("FYERS_SECRET_KEY", os.getenv("FYERS_SECRET_KEY", ""))
REDIRECT = st.secrets.get("FYERS_REDIRECT_URL", "https://trading-journal.streamlit.app/")

if not APP_ID or not SECRET:
    st.error("Fyers credentials missing in secrets.")
    st.stop()

st.info(f"App ID: `{APP_ID}`")

session = fyersModel.SessionModel(
    client_id=APP_ID,
    secret_key=SECRET,
    redirect_uri=REDIRECT,
    response_type="code",
    grant_type="authorization_code",
)

st.subheader("Step 1: Login to Fyers")
auth_url = session.generate_authcode()
st.markdown(f"[👉 Click here to login to Fyers]({auth_url})")
st.caption("After login, Fyers will redirect you back. Copy the `auth_code` from the URL.")

st.subheader("Step 2: Paste the auth_code")
auth_code = st.text_input("auth_code", placeholder="Paste the long string after 'auth_code=' in the URL")

if st.button("Generate Access Token", type="primary"):
    if not auth_code:
        st.warning("Paste the auth_code first.")
    else:
        try:
            session.set_token(auth_code)
            response = session.generate_token()
            if "access_token" in response:
                token = response["access_token"]
                st.success("✅ Token generated!")
                st.code(token, language=None)
                st.warning("Copy this token and paste it into Streamlit Secrets as `FYERS_ACCESS_TOKEN`, then restart the app.")
            else:
                st.error(f"Failed: {response}")
        except Exception as e:
            st.error(f"Error: {e}")
