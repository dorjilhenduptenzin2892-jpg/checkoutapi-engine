# Merchant-side integration script template

Paste this script near the bottom of your merchant checkout page, before `</body>`.

```html
<script>
  (function () {
    // ===== Merchant configuration =====
    const apiUrl = 'https://YOUR-VERCEL-APP.vercel.app/api/initiate';
    const merchantId = '863990030700270';

    // ===== Page selectors (customize these) =====
    const amountSelector = '#amount';
    const currencySelector = '#currency';
    const orderRefSelector = '#orderRef';
    const customerNameSelector = '#customerName';
    const emailSelector = '#email';
    const mobilePhoneSelector = '#mobilePhone';
    const checkoutButtonSelector = '#checkoutButton';

    // Optional defaults
    const successReturnUrl = 'https://merchant-site.com/payment/success';
    const failReturnUrl = 'https://merchant-site.com/payment/fail';

    function getValue(selector) {
      const el = document.querySelector(selector);
      return el ? String(el.value || '').trim() : '';
    }

    function buildHidden(name, value) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      return input;
    }

    function startPayment(event) {
      event.preventDefault();

      const amount = getValue(amountSelector);
      const currency = getValue(currencySelector) || '356'; // 356 = INR, 840 = USD
      const orderRef = getValue(orderRefSelector);
      const customerName = getValue(customerNameSelector);
      const email = getValue(emailSelector);
      const mobilePhone = getValue(mobilePhoneSelector);

      // Required by backend validation
      const customerRef = customerName || orderRef;

      if (!amount || !orderRef) {
        alert('Amount and order reference are required.');
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = apiUrl;
      form.style.display = 'none';

      form.appendChild(buildHidden('merchantId', merchantId));
      form.appendChild(buildHidden('amount', amount));
      form.appendChild(buildHidden('currency', currency));
      form.appendChild(buildHidden('orderRef', orderRef));
      form.appendChild(buildHidden('customerRef', customerRef));

      if (customerName) form.appendChild(buildHidden('customerName', customerName));
      if (email) form.appendChild(buildHidden('email', email));
      if (mobilePhone) form.appendChild(buildHidden('mobilePhone', mobilePhone));
      if (successReturnUrl) form.appendChild(buildHidden('successReturnUrl', successReturnUrl));
      if (failReturnUrl) form.appendChild(buildHidden('failReturnUrl', failReturnUrl));

      document.body.appendChild(form);
      form.submit();
    }

    const checkoutButton = document.querySelector(checkoutButtonSelector);
    if (!checkoutButton) {
      console.error('Checkout button not found. Update checkoutButtonSelector.');
      return;
    }

    checkoutButton.addEventListener('click', startPayment);
  })();
</script>
```

Notes:
- Do not collect PAN, expiry, CVV, or cardholder name on merchant page.
- Keep all secure Cardzone logic only on backend.
- Send `currency` from merchant site as a numeric ISO code, for example `356` for INR or `840` for USD.
- If `currency` is omitted, backend falls back to `356` (INR).
