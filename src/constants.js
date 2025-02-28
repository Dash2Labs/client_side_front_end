/* eslint-disable */
const constants = {
    server: __SERVER__,
    product_title: __PRODUCT_TITLE__,
    customer_logo: __CUSTOMER_LOGO__,
    home_image_1: __HOME_IMAGE_1__,
    home_image_2: __HOME_IMAGE_2__,
    home_image_3: __HOME_IMAGE_3__,
    expirationTime: __EXPIRATION_TIME__,
    ratingsEnabled: true,
    textFeedbackEnabled: true,
    requireProfileImage: true,
    defaultProfileImage: "",
    historyLength: 5,
    logingMessage: "Logging in...",
    loginProfileImage: "",
    useAzure: __USE_AZURE__,
};

const dangerousConstants = {
    app_id: __APP_ID__,
    app_authority: __APP_AUTHORITY__,
    redirect_uri: __REDIRECT_URI__,
    useauth: __USEAUTH__,
    debug: __DEBUG__,
    maxLength: __MAX_LENGTH__,
    expirationTime: __EXPIRATION_TIME__,
}

export { constants, dangerousConstants };
