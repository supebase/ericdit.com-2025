interface CustomMessages {
    [key: string]: any;
}

export function useFormatDate(date: Date | string | number, customMessages: CustomMessages = {}): Ref<string> {
    if (!date || isNaN(new Date(date).getTime())) {
        return ref('Invalid Date');
    }

    const timeAgo = useTimeAgo(date);

    const messages: CustomMessages = {
        justNow: '刚刚',
        past: (n: string) => `${n}前`,
        future: (n: string) => `${n}后`,
        month: (n: string, past: boolean) => `${n} 个月${past ? '前' : '后'}`,
        year: (n: string, past: boolean) => `${n} 年${past ? '前' : '后'}`,
        day: (n: string, past: boolean) => `${n} 天${past ? '前' : '后'}`,
        week: (n: string, past: boolean) => `${n} 周${past ? '前' : '后'}`,
        hour: (n: string, past: boolean) => `${n} 小时${past ? '前' : '后'}`,
        minute: (n: string, past: boolean) => `${n} 分钟${past ? '前' : '后'}`,
        second: (n: string, past: boolean) => `${n} 秒${past ? '前' : '后'}`,
        yesterday: '昨天',
        lastWeek: '上周',
        lastMonth: '上个月',
        lastYear: '去年',
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
    const englishReadingSpeed = 200; // 英文单词
    const chineseReadingSpeed = 400; // 中文字符

    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const count = isChinese ? text.replace(/[^\x00-\xff]/g, "xx").length : text.split(/\s+/).length;
    const speed = isChinese ? chineseReadingSpeed : englishReadingSpeed;

    return Math.ceil(count / speed) + " 分钟";
}