import {type AppProps, type AppType} from "next/app";

import {api} from "~/utils/api";
import "~/styles/globals.css";

import {NextIntlClientProvider} from "next-intl";

const MyApp: AppType = ({Component, pageProps}: AppProps) => {
    return (
        <>
            <NextIntlClientProvider messages={pageProps.messages}>
                <Component {...pageProps} />
            </NextIntlClientProvider>
        </>
    );
};

export default api.withTRPC(MyApp);
