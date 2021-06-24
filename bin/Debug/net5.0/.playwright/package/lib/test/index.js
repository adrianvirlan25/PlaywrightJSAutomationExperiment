"use strict";
/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports._baseTest = exports.expect = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const testType_1 = require("./testType");
var expect_1 = require("./expect");
Object.defineProperty(exports, "expect", { enumerable: true, get: function () { return expect_1.expect; } });
exports._baseTest = testType_1.rootTestType.test;
exports.test = exports._baseTest.extend({
    defaultBrowserType: ['chromium', { scope: 'worker' }],
    browserName: [({ defaultBrowserType }, use) => use(defaultBrowserType), { scope: 'worker' }],
    playwright: [require('../inprocess'), { scope: 'worker' }],
    headless: [undefined, { scope: 'worker' }],
    channel: [undefined, { scope: 'worker' }],
    slowMo: [undefined, { scope: 'worker' }],
    launchOptions: [{}, { scope: 'worker' }],
    browser: [async ({ playwright, browserName, headless, channel, slowMo, launchOptions }, use) => {
            if (!['chromium', 'firefox', 'webkit'].includes(browserName))
                throw new Error(`Unexpected browserName "${browserName}", must be one of "chromium", "firefox" or "webkit"`);
            const options = {
                handleSIGINT: false,
                ...launchOptions,
            };
            if (headless !== undefined)
                options.headless = headless;
            if (channel !== undefined)
                options.channel = channel;
            if (slowMo !== undefined)
                options.slowMo = slowMo;
            const browser = await playwright[browserName].launch(options);
            await use(browser);
            await browser.close();
        }, { scope: 'worker' }],
    screenshot: 'off',
    video: 'off',
    trace: 'off',
    acceptDownloads: undefined,
    bypassCSP: undefined,
    colorScheme: undefined,
    reducedMotion: undefined,
    deviceScaleFactor: undefined,
    extraHTTPHeaders: undefined,
    geolocation: undefined,
    hasTouch: undefined,
    httpCredentials: undefined,
    ignoreHTTPSErrors: undefined,
    isMobile: undefined,
    javaScriptEnabled: undefined,
    locale: undefined,
    offline: undefined,
    permissions: undefined,
    proxy: undefined,
    storageState: undefined,
    timezoneId: undefined,
    userAgent: undefined,
    viewport: undefined,
    contextOptions: {},
    context: async ({ browser, screenshot, trace, video, acceptDownloads, bypassCSP, colorScheme, reducedMotion, deviceScaleFactor, extraHTTPHeaders, hasTouch, geolocation, httpCredentials, ignoreHTTPSErrors, isMobile, javaScriptEnabled, locale, offline, permissions, proxy, storageState, viewport, timezoneId, userAgent, contextOptions }, use, testInfo) => {
        testInfo.snapshotSuffix = process.platform;
        if (process.env.PWDEBUG)
            testInfo.setTimeout(0);
        const recordVideo = video === 'on' || video === 'retain-on-failure' ||
            (video === 'retry-with-video' && !!testInfo.retry);
        const options = {
            recordVideo: recordVideo ? { dir: testInfo.outputPath('') } : undefined,
            ...contextOptions,
        };
        if (acceptDownloads !== undefined)
            options.acceptDownloads = acceptDownloads;
        if (bypassCSP !== undefined)
            options.bypassCSP = bypassCSP;
        if (colorScheme !== undefined)
            options.colorScheme = colorScheme;
        if (reducedMotion !== undefined)
            options.reducedMotion = reducedMotion;
        if (deviceScaleFactor !== undefined)
            options.deviceScaleFactor = deviceScaleFactor;
        if (extraHTTPHeaders !== undefined)
            options.extraHTTPHeaders = extraHTTPHeaders;
        if (geolocation !== undefined)
            options.geolocation = geolocation;
        if (hasTouch !== undefined)
            options.hasTouch = hasTouch;
        if (httpCredentials !== undefined)
            options.httpCredentials = httpCredentials;
        if (ignoreHTTPSErrors !== undefined)
            options.ignoreHTTPSErrors = ignoreHTTPSErrors;
        if (isMobile !== undefined)
            options.isMobile = isMobile;
        if (javaScriptEnabled !== undefined)
            options.javaScriptEnabled = javaScriptEnabled;
        if (locale !== undefined)
            options.locale = locale;
        if (offline !== undefined)
            options.offline = offline;
        if (permissions !== undefined)
            options.permissions = permissions;
        if (proxy !== undefined)
            options.proxy = proxy;
        if (storageState !== undefined)
            options.storageState = storageState;
        if (timezoneId !== undefined)
            options.timezoneId = timezoneId;
        if (userAgent !== undefined)
            options.userAgent = userAgent;
        if (viewport !== undefined)
            options.viewport = viewport;
        const context = await browser.newContext(options);
        const allPages = [];
        context.on('page', page => allPages.push(page));
        const collectingTrace = trace === 'on' || trace === 'retain-on-failure' || (trace === 'retry-with-trace' && testInfo.retry);
        if (collectingTrace) {
            const name = path.relative(testInfo.project.outputDir, testInfo.outputDir).replace(/[\/\\]/g, '-');
            await context.tracing.start({ name, screenshots: true, snapshots: true });
        }
        await use(context);
        const testFailed = testInfo.status !== testInfo.expectedStatus;
        const saveTrace = trace === 'on' || (testFailed && trace === 'retain-on-failure') || (trace === 'retry-with-trace' && testInfo.retry);
        if (saveTrace) {
            const tracePath = testInfo.outputPath(`trace.zip`);
            await context.tracing.stop({ path: tracePath });
        }
        else if (collectingTrace) {
            await context.tracing.stop();
        }
        if (screenshot === 'on' || (screenshot === 'only-on-failure' && testFailed)) {
            await Promise.all(allPages.map((page, index) => {
                const screenshotPath = testInfo.outputPath(`test-${testFailed ? 'failed' : 'finished'}-${++index}.png`);
                return page.screenshot({ timeout: 5000, path: screenshotPath }).catch(e => { });
            }));
        }
        await context.close();
        const deleteVideos = video === 'retain-on-failure' && !testFailed;
        if (deleteVideos) {
            await Promise.all(allPages.map(async (page) => {
                const video = page.video();
                if (!video)
                    return;
                try {
                    const videoPath = await video.path();
                    await fs.promises.unlink(videoPath);
                }
                catch (e) {
                    // Silent catch.
                }
            }));
        }
    },
    page: async ({ context }, use) => {
        await use(await context.newPage());
    },
});
exports.default = exports.test;
//# sourceMappingURL=index.js.map