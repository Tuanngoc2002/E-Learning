import HmacSHA512 from 'crypto-js/hmac-sha512';

const config = {
    tmnCode: 'B77INC60',
    secretKey: 'NU3W61XPNAW4DDRSYM30E0G4GL97VG7M',
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
};

const vnpayService = {
    createPayment: async (orderInfo: { price: number; return_url: string; ipAddr?: string }) => {
        try {
            const date = new Date();
            const createDate = date.getFullYear().toString() +
                             ('0' + (date.getMonth() + 1)).slice(-2) +
                             ('0' + date.getDate()).slice(-2) +
                             ('0' + date.getHours()).slice(-2) +
                             ('0' + date.getMinutes()).slice(-2) +
                             ('0' + date.getSeconds()).slice(-2);

            // Generate random 8-digit transaction reference
            const txnRef = Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');

            if (!orderInfo.return_url) {
                throw new Error('returnUrl is required');
            }

            const queryParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: config.tmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: `Thanh toan don hang :${txnRef}`,
                vnp_OrderType: 'other',
                // Convert USD to VND (1 USD = 24000 VND) and multiply by 100 as per VNPAY requirement
                vnp_Amount: parseInt(String(orderInfo.price * 24000 * 100)),
                vnp_ReturnUrl: orderInfo.return_url,
                vnp_IpAddr: orderInfo.ipAddr || '127.0.0.1',
                vnp_CreateDate: createDate
            };

            const sortedParams = Object.keys(queryParams)
                .sort()
                .reduce((acc: Record<string, any>, key) => {
                    if (queryParams[key as keyof typeof queryParams] !== '' && 
                        queryParams[key as keyof typeof queryParams] !== null && 
                        queryParams[key as keyof typeof queryParams] !== undefined) {
                        acc[key] = queryParams[key as keyof typeof queryParams];
                    }
                    return acc;
                }, {});

            const signData = Object.entries(sortedParams)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&')
                .replace(/%20/g, '+');

            const signed = HmacSHA512(signData, config.secretKey).toString();
            const paymentUrl = `${config.vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
            
            return { paymentUrl, txnRef };
        } catch (error) {
            console.error('VNPAY Payment Error:', error);
            throw error;
        }
    },

    verifyReturnUrl: (query: Record<string, string>) => {
        try {
            const vnp_SecureHash = query.vnp_SecureHash;
            delete query.vnp_SecureHash;
            delete query.vnp_SecureHashType;

            // Sort query parameters
            const sortedQuery = Object.keys(query)
                .sort()
                .reduce((acc: Record<string, string>, key) => {
                    if (query[key] !== '' && query[key] !== null && query[key] !== undefined) {
                        acc[key] = query[key];
                    }
                    return acc;
                }, {});

            // Create sign data
            const signData = Object.entries(sortedQuery)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&')
                .replace(/%20/g, '+');

            const signed = HmacSHA512(signData, config.secretKey).toString();

            // Compare signatures
            return vnp_SecureHash === signed;
        } catch (error) {
            console.error('VNPAY Verification Error:', error);
            return false;
        }
    }
};

export default vnpayService;
