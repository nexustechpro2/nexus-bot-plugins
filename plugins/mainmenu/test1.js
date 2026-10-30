import os from 'os'
import fs from 'fs'
import path from 'path'

/**
 * Simple Status Plugin - Product Message Style
 * Display basic bot information as a product card
 */
export default {
    name: "status",
    commands: ["status", "ping", "alive"],
    description: "Display basic bot status",
    adminOnly: false,
    category: "mainmenu",

    async execute(sock, sessionId, args, m) {
        try {
            const startTime = Date.now()

            // Get container memory stats
            const memStats = await this.getContainerMemory()

            // Get process memory
            const processMemMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

            // Calculate response time
            const responseTime = Date.now() - startTime

            // Get uptime
            const uptime = this.formatUptime(process.uptime())

            // Get CPU info
            const cpuCount = os.cpus().length

            // Get local image
            let thumbnail = null
            const possiblePaths = [
                path.resolve(process.cwd(), "Defaults", "images", "menu.png"),
                path.resolve(process.cwd(), "defaults", "images", "menu.png"),
                path.resolve(process.cwd(), "assets", "images", "menu.png")
            ]

            for (const imagePath of possiblePaths) {
                if (fs.existsSync(imagePath)) {
                    thumbnail = fs.readFileSync(imagePath)
                    break
                }
            }

            if (!thumbnail) {
                thumbnail = "https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Nexus+Bot"
            }

            const bodyText =
                `⚡ Response: ${responseTime}ms\n` +
                `⏱️ Uptime: ${uptime}\n` +
                `💾 RAM: ${memStats.used} / ${memStats.limit}\n` +
                `📊 Process: ${processMemMB}MB\n` +
                `🖥️ CPU: ${cpuCount} cores\n` +
                `🤖 Version: v2.0`

            await sock.sendProductMessage(m.chat, {
                thumbnail,
                productId: 'NEXUS_STATUS_001',
                title: '✨ Nexus Bot Status',
                description: bodyText,
                currencyCode: 'USD',
                priceAmount1000: '999',
                retailerId: 'NexusTech',
                url: '',
                body: '✨ Bot is online and running smoothly!',
                footer: '© 𝕹𝖊𝖝𝖚𝖘 𝕭𝖔𝖙',
                buttons: [
                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📊 Refresh', id: 'status_refresh' }) },
                    { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '🌐 Dashboard', url: 'https://example.com' }) },
                    { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: '📋 Copy Info', copy_code: bodyText }) }
                ]
            }, m)

            return { success: true }

        } catch (error) {
            console.error("[Status] Error:", error)
            await sock.sendMessage(
                m.chat,
                { text: "❌ Error getting status.\n\n> © 𝕹𝖊𝖝𝖚𝖘 𝕭𝖔𝖙" },
                { quoted: m }
            )
            return { success: false, error: error.message }
        }
    },

    async getContainerMemory() {
        try {
            if (fs.existsSync('/sys/fs/cgroup/memory.current')) {
                try {
                    const used = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.current', 'utf8'))
                    const limit = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8'))
                    return {
                        used: (used / 1024 / 1024 / 1024).toFixed(2) + 'GB',
                        limit: limit === 9223372036854771712 ? 'unlimited' : (limit / 1024 / 1024 / 1024).toFixed(2) + 'GB'
                    }
                } catch (err) { }
            }

            if (fs.existsSync('/sys/fs/cgroup/memory/memory.usage_in_bytes')) {
                try {
                    const used = parseInt(fs.readFileSync('/sys/fs/cgroup/memory/memory.usage_in_bytes', 'utf8'))
                    const limit = parseInt(fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8'))
                    return {
                        used: (used / 1024 / 1024 / 1024).toFixed(2) + 'GB',
                        limit: limit > 9000000000000000 ? 'unlimited' : (limit / 1024 / 1024 / 1024).toFixed(2) + 'GB'
                    }
                } catch (err) { }
            }

            const totalMem = os.totalmem() / 1024 / 1024 / 1024
            const freeMem = os.freemem() / 1024 / 1024 / 1024
            return { used: (totalMem - freeMem).toFixed(2) + 'GB', limit: totalMem.toFixed(2) + 'GB' }
        } catch (error) {
            const totalMem = os.totalmem() / 1024 / 1024 / 1024
            const freeMem = os.freemem() / 1024 / 1024 / 1024
            return { used: (totalMem - freeMem).toFixed(2) + 'GB', limit: totalMem.toFixed(2) + 'GB' }
        }
    },

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m`
        if (minutes > 0) return `${minutes}m ${secs}s`
        return `${secs}s`
    },
}




//carousel
import os from 'os'
import fs from 'fs'
import path from 'path'

/**
 * Carousel Status Plugin
 * Displays bot status across multiple gorgeous swipeable cards
 */
export default {
    name: "status",
    commands: ["status", "ping", "alive"],
    description: "Display bot status as carousel cards",
    adminOnly: false,
    category: "mainmenu",

    async execute(sock, sessionId, args, m) {
        try {
            const startTime = Date.now()

            // 1. Gather stats
            const memStats = await this.getContainerMemory()
            const processMemMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
            const responseTime = Date.now() - startTime
            const uptime = this.formatUptime(process.uptime())
            const cpuCount = os.cpus().length

            // 2. Resolve local menu image path if available, or fallback
            let imageUrl1 = "https://via.placeholder.com/800x400/1a1a1a/00ff00?text=System+Performance"
            let imageUrl2 = "https://via.placeholder.com/800x400/1a1a1a/0088ff?text=Bot+Application+Runtime"

            const possiblePaths = [
                path.resolve(process.cwd(), "Defaults", "images", "menu.png"),
                path.resolve(process.cwd(), "defaults", "images", "menu.png"),
                path.resolve(process.cwd(), "assets", "images", "menu.png")
            ]

            for (const imgPath of possiblePaths) {
                if (fs.existsSync(imgPath)) {
                    // Pass the file path directly; Baileys prepMedia handles local absolute paths perfectly!
                    imageUrl1 = imgPath
                    imageUrl2 = imgPath
                    break
                }
            }

            // 3. Build the Carousel Payload
            const carouselData = {
                body: '🤖 *Nexus Bot Panel Status Dashboard*\nSwipe left/right to see all real-time parameters.',
                footer: '© 𝕹𝖊𝖝𝖚𝖘 𝕭𝖔𝖙',
                cards: [
                    {
                        headerTitle: '🖥️ System Performance',
                        headerSubtitle: 'Hardware utilization metrics',
                        bodyText: `⚡ Speed: ${responseTime}ms\n💾 RAM: ${memStats.used} / ${memStats.limit}\n🖥️ CPU: ${cpuCount} cores`,
                        footerText: 'Server Health: Excellent',
                        imageUrl: imageUrl1,
                        buttons: [
                            {
                                name: 'quick_reply',
                                params: { display_text: '🔄 Refresh Status', id: 'status_refresh' }
                            }
                        ]
                    },
                    {
                        headerTitle: '🚀 Application Runtime',
                        headerSubtitle: 'Process statistics and session info',
                        bodyText: `⏱️ Uptime: ${uptime}\n📊 Heap: ${processMemMB} MB\n🤖 Version: v2.0`,
                        footerText: `Session: ${sessionId || 'Nexus-Session'}`,
                        imageUrl: imageUrl2,
                        buttons: [
                            {
                                name: 'cta_url',
                                params: { display_text: '🌐 Open Web Panel', url: 'https://example.com' }
                            },
                            {
                                name: 'cta_copy',
                                params: { display_text: '📋 Copy Status Info', copy_code: `Speed: ${responseTime}ms | RAM: ${memStats.used} | Uptime: ${uptime}` }
                            }
                        ]
                    }
                ]
            }

            // 4. Send Carousel Message using the built-in Baileys helper
            await sock.sendCarouselMessage(m.chat, carouselData, m)

            return { success: true }

        } catch (error) {
            console.error("[Status Carousel] Error:", error)
            await sock.sendMessage(
                m.chat,
                { text: `❌ Error generating status dashboard.\n\n> © 𝕹𝖊𝖝𝖚𝖘 𝕭𝖔𝖙` },
                { quoted: m }
            )
            return { success: false, error: error.message }
        }
    },

    async getContainerMemory() {
        try {
            if (fs.existsSync('/sys/fs/cgroup/memory.current')) {
                try {
                    const used = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.current', 'utf8'))
                    const limit = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8'))

                    return {
                        used: (used / 1024 / 1024 / 1024).toFixed(2) + 'GB',
                        limit: limit === 9223372036854771712 ? 'unlimited' : (limit / 1024 / 1024 / 1024).toFixed(2) + 'GB'
                    }
                } catch (err) { }
            }

            if (fs.existsSync('/sys/fs/cgroup/memory/memory.usage_in_bytes')) {
                try {
                    const used = parseInt(fs.readFileSync('/sys/fs/cgroup/memory/memory.usage_in_bytes', 'utf8'))
                    const limit = parseInt(fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8'))

                    return {
                        used: (used / 1024 / 1024 / 1024).toFixed(2) + 'GB',
                        limit: limit > 9000000000000000 ? 'unlimited' : (limit / 1024 / 1024 / 1024).toFixed(2) + 'GB'
                    }
                } catch (err) { }
            }

            const totalMem = os.totalmem() / 1024 / 1024 / 1024
            const freeMem = os.freemem() / 1024 / 1024 / 1024
            const usedMem = totalMem - freeMem

            return {
                used: usedMem.toFixed(2) + 'GB',
                limit: totalMem.toFixed(2) + 'GB'
            }
        } catch (error) {
            const totalMem = os.totalmem() / 1024 / 1024 / 1024
            const freeMem = os.freemem() / 1024 / 1024 / 1024
            const usedMem = totalMem - freeMem

            return {
                used: usedMem.toFixed(2) + 'GB',
                limit: totalMem.toFixed(2) + 'GB'
            }
        }
    },

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)

        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m`
        if (minutes > 0) return `${minutes}m ${secs}s`
        return `${secs}s`
    },
}
