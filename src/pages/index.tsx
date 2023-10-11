import {GetStaticPropsContext, type NextPage} from "next";
import Head from "next/head";
import { useState } from "react";
import { Github, Twitter } from "lucide-react";

import { ChatGPTEditor } from "../sections/ChatGPTEditor";
import { EncoderSelect } from "~/sections/EncoderSelect";
import { TokenViewer } from "~/sections/TokenViewer";
import { TextArea } from "~/components/Input";
import {
  encoding_for_model,
  get_encoding,
  type TiktokenModel,
  type TiktokenEncoding,
} from "tiktoken";
import { getSegments } from "~/utils/segments";
import {useTranslations} from "use-intl";
import LocaleSwitcher from "~/components/LocaleSwitcher";

function getUserSelectedEncoder(
  params: { model: TiktokenModel } | { encoder: TiktokenEncoding }
) {
  if ("model" in params) {
    if (
      params.model === "gpt-4" ||
      params.model === "gpt-4-32k" ||
      params.model === "gpt-3.5-turbo"
    ) {
      return encoding_for_model(params.model, {
        "<|im_start|>": 100264,
        "<|im_end|>": 100265,
        "<|im_sep|>": 100266,
      });
    }

    return encoding_for_model(params.model);
  }

  if ("encoder" in params) {
    return get_encoding(params.encoder);
  }

  throw new Error("Invalid params");
}

function isChatModel(
  params: { model: TiktokenModel } | { encoder: TiktokenEncoding }
): params is { model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-32k" } {
  return (
    "model" in params &&
    (params.model === "gpt-3.5-turbo" ||
      params.model === "gpt-4" ||
      params.model === "gpt-4-32k")
  );
}

export async function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}

const Home: NextPage = () => {
  const [inputText, setInputText] = useState<string>("");
  const [params, setParams] = useState<
    { model: TiktokenModel } | { encoder: TiktokenEncoding }
  >({ model: "gpt-3.5-turbo" });

  const [encoder, setEncoder] = useState(() => getUserSelectedEncoder(params));
  const data = getSegments(encoder, inputText);

  const t= useTranslations();

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-4 p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold">{t('tiktokenizer')}</h1>

          <EncoderSelect
            value={params}
            onChange={(update) => {
              setEncoder((encoder) => {
                encoder.free();
                return getUserSelectedEncoder(update);
              });

              if (isChatModel(update) !== isChatModel(params)) {
                setInputText("");
              }

              setParams(update);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-4">
            {isChatModel(params) && (
              <ChatGPTEditor model={params.model} onChange={setInputText} />
            )}

            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[256px] rounded-md border p-4 font-mono shadow-sm"
            />
          </section>

          <section className="flex flex-col gap-4">
            <TokenViewer
              model={"model" in params ? params.model : undefined}
              data={data}
              isFetching={false}
            />
          </section>
        </div>
        <style jsx>
          {`
            .diagram-link:hover > span {
              margin-left: 0;
            }

            .diagram-link > svg {
              opacity: 0;
              transform: scale(0.8);
            }
            .diagram-link:hover > svg {
              opacity: 1;
              transform: scale(1);
            }
          `}
        </style>
        <div className="flex justify-between text-center md:mt-6">
          <LocaleSwitcher />
          <p className=" text-sm text-slate-400">
            {`${t('poweredBy')} `}
              <a
              target="_blank"
              rel="noreferrer"
              className="text-slate-800"
              href="https://ai.puerhub.xyz">
            PuerHub AI
          </a>.
          </p>

        </div>
      </main>
    </>
  );
};

export default Home;
