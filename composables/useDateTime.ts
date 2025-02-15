interface CustomMessages {
  [key: string]: any;
}

export function useFormatDate(
  date: Date | string | number,
  customMessages: CustomMessages = {}
): Ref<string> {
  if (!date || isNaN(new Date(date).getTime())) {
    return ref("Invalid Date");
  }

  const timeAgo = useTimeAgo(date);
  const { t, locale } = useI18n(); // Retrieve current locale

  const isEnglish = locale.value === "en";

  const messages: CustomMessages = {
    justNow: t("common_justnow"),
    past: (n: string) => t("common_time_past", { n }),
    future: (n: string) => t("common_time_future", { n }),
    month: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_month", { n }) })
        : t("common_time_future", { n: t("common_time_month", { n }) }),
    year: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_year", { n }) })
        : t("common_time_future", { n: t("common_time_year", { n }) }),
    day: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_day", { n }) })
        : t("common_time_future", { n: t("common_time_day", { n }) }),
    week: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_week", { n }) })
        : t("common_time_future", { n: t("common_time_week", { n }) }),
    hour: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_hour", { n }) })
        : t("common_time_future", { n: t("common_time_hour", { n }) }),
    minute: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_minute", { n }) })
        : t("common_time_future", { n: t("common_time_minute", { n }) }),
    second: (n: string, past: boolean) =>
      past
        ? t("common_time_past", { n: t("common_time_second", { n }) })
        : t("common_time_future", { n: t("common_time_second", { n }) }),
    yesterday: t("common_yesterday"),
    lastWeek: t("common_lastweak"),
    lastMonth: t("common_lastmonth"),
    lastYear: t("common_lastyear"),
    // Adjust plural forms for English
    ...(isEnglish
      ? {
          second_plural: (n: string) => t("common_time_second", { n }) + "s", // e.g., "2 seconds"
          minute_plural: (n: string) => t("common_time_minute", { n }) + "s", // e.g., "5 minutes"
          hour_plural: (n: string) => t("common_time_hour", { n }) + "s", // e.g., "3 hours"
          day_plural: (n: string) => t("common_time_day", { n }) + "s", // e.g., "7 days"
          week_plural: (n: string) => t("common_time_week", { n }) + "s", // e.g., "4 weeks"
          month_plural: (n: string) => t("common_time_month", { n }) + "s", // e.g., "6 months"
          year_plural: (n: string) => t("common_time_year", { n }) + "s", // e.g., "2 years"
        }
      : {}),
    ...customMessages,
  };

  const customTimeAgo = computed(() =>
    timeAgo.value.replace(
      /just now|(\d+)\s(second|minute|hour|day|week|month|year)s? ago|in (\d+)\s(second|minute|hour|day|week|month|year)s?|yesterday|last week|last month|last year/,
      (match, p1, p2, p3, p4) => {
        if (match === "just now") return messages.justNow as string;
        if (match === "yesterday") return messages.yesterday as string;
        if (match === "last week") return messages.lastWeek as string;
        if (match === "last month") return messages.lastMonth as string;
        if (match === "last year") return messages.lastYear as string;
        if (p1 && p2) {
          // Handle pluralization for English
          if (isEnglish && parseInt(p1) > 1) {
            return (
              (messages[`${p2}_plural`] as (n: string) => string)(p1) + " ago"
            ); // Handle plural
          }
          return (messages[p2] as (n: string, past: boolean) => string)(
            p1,
            true
          ); // Singular case
        }
        if (p3 && p4) {
          return (messages[p4] as (n: string, past: boolean) => string)(
            p3,
            false
          ); // Future case
        }
        return match;
      }
    )
  );

  return customTimeAgo;
}

export function useReadingTime(text: string) {
  const { t } = useI18n();

  const englishReadingSpeed = 200; // 英文单词
  const chineseReadingSpeed = 400; // 中文字符

  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  const count = isChinese
    ? text.replace(/[^\x00-\xff]/g, "xx").length
    : text.split(/\s+/).length;
  const speed = isChinese ? chineseReadingSpeed : englishReadingSpeed;

  return Math.ceil(count / speed) + t("common_readingtime_minute");
}
