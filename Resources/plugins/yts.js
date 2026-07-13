const axios = require('axios');

module.exports = {
    name: 'yts',
    alias: ['ytsearch', 'tafuta'],
    category: 'search',
    desc: 'Kutafuta video au nyimbo YouTube.',
    async run({ client, m, text, prefix }) {
        if (!text) return m.reply(`*Tafadhali weka jina la wimbo/video unayotafuta!*\n_Mfano: ${prefix}yts Diamond Platnumz_`);
        
        m.reply('_Natafuta YouTube..._ 🔍');
        
        try {
            // API ya bure ya kutafuta YouTube
            const res = await axios.get(`https://api.cafirexos.com/api/ytsearch?q=${encodeURIComponent(text)}`);
            const results = res.data.results;
            
            if (!results || results.length === 0) return m.reply('*Sijapata matokeo yoyote yaliyofanana na hayo!*');
            
            let searchResultText = `*YOUTUBE SEARCH RESULTS* 🎥\n\n`;
            
            // Tunachukua matokeo 5 ya kwanza tu
            const limit = results.length > 5 ? 5 : results.length;
            for (let i = 0; i < limit; i++) {
                const video = results[i];
                searchResultText += `*${i + 1}. ${video.title}*\n` +
                                    `• *Muda:* ${video.timestamp || 'N/A'}\n` +
                                    `• *Kiungo (Link):* ${video.url}\n` +
                                    `• *Views:* ${video.views || 'N/A'}\n\n`;
            }
            
            await client.sendMessage(m.chat, {
                image: { url: results[0].image || results[0].thumbnail },
                caption: searchResultText + `_Tafuta zaidi kwa kutumia link zilizopo juu!_`
            }, { quoted: m });
            
        } catch (error) {
            console.log(error);
            m.reply('*Kuna tatizo limetokea wakati wa kutafuta YouTube. Jaribu tena.*');
        }
    }
}
