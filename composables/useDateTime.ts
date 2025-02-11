interface CustomMessages {
    [key: string]: any;
}

export function useFormatDate(date: Date | string | number, customMessages: CustomMessages = {}): Ref<string> {
    if (!date || isNaN(new Date(date).getTime())) {
        return ref('Invalid Date');
    }

    const timeAgo = useTimeAgo(date);
    const { t } = useI18n();

    const messages: CustomMessages = {
        justNow: t('common_justnow'),
        past: (n: string) => t('common_time_past', { n }), // 使用插值
        future: (n: string) => t('common_time_future', { n }), // 使用插值
        month: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_month', { n }) }) // 例如：3 个月前
                : t('common_time_future', { n: t('common_time_month', { n }) }), // 例如：3 个月后
        year: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_year', { n }) }) // 例如：2 年前
                : t('common_time_future', { n: t('common_time_year', { n }) }), // 例如：2 年后
        day: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_day', { n }) }) // 例如：5 天前
                : t('common_time_future', { n: t('common_time_day', { n }) }), // 例如：5 天后
        week: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_week', { n }) }) // 例如：1 周前
                : t('common_time_future', { n: t('common_time_week', { n }) }), // 例如：1 周后
        hour: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_hour', { n }) }) // 例如：2 小时前
                : t('common_time_future', { n: t('common_time_hour', { n }) }), // 例如：2 小时后
        minute: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_minute', { n }) }) // 例如：10 分钟前
                : t('common_time_future', { n: t('common_time_minute', { n }) }), // 例如：10 分钟后
        second: (n: string, past: boolean) =>
            past
                ? t('common_time_past', { n: t('common_time_second', { n }) }) // 例如：30 秒前
                : t('common_time_future', { n: t('common_time_second', { n }) }), // 例如：30 秒后
        yesterday: t('common_yesterday'),
        lastWeek: t('common_lastweak'),
        lastMonth: t('common_lastmonth'),
        lastYear: t('common_lastyear'),
        ...customMessages,
    };

    const customTimeAgo = computed(() =>
        timeAgo.value.replace(
            /just now|(\d+)\s(second|minute|hour|day|week|month|year)s? ago|in (\d+)\s(second|minute|hour|day|week|month|year)s?|yesterday|last week|last month|last year/,
            (match, p1, p2, p3, p4) => {
                if (match === 'just now') return messages.justNow as string;
                if (match === 'yesterday') return messages.yesterday as string;
                if (match === 'last week') return messages.lastWeek as string;
                if (match === 'last month') return messages.lastMonth as string;
                if (match === 'last year') return messages.lastYear as string;
                if (p1 && p2) return (messages[p2] as (n: string, past: boolean) => string)(p1, true);
                if (p3 && p4) return (messages[p4] as (n: string, past: boolean) => string)(p3, false);
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
    const count = isChinese ? text.replace(/[^\x00-\xff]/g, "xx").length : text.split(/\s+/).length;
    const speed = isChinese ? chineseReadingSpeed : englishReadingSpeed;

    return Math.ceil(count / speed) + t('common_readingtime_minute');
}