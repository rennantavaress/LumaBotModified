import { Logger } from "../utils/Logger.js";
import { GroupManager } from "../managers/GroupManager.js";
import { MediaProcessor } from "./MediaProcessor.js";
import { DatabaseService } from "../services/Database.js";
import { PersonalityManager } from "../managers/PersonalityManager.js";
import fs from "fs";
import { MENUS } from "../config/constants.js";
import { LUMA_CONFIG } from "../config/lumaConfig.js";
import { ReminderService } from "../core/services/ReminderService.js";
import { RankPlugin } from "../plugins/luma/RankPlugin.js";
import { VideoDownloader } from "../services/VideoDownloader.js";
import { UserPlugin } from "../plugins/user/UserPlugin.js";
import { extractUrl } from "../utils/MessageUtils.js";

/**
 * Despachante de ferramentas acionadas pela IA.
 * Recebe as chamadas de função (tool calls) do Gemini e as executa.
 */
export class ToolDispatcher {
    static async handleClearHistory(bot, lumaHandler) {
        const msg = (bot.body || "").toLowerCase();

        const clearPatterns = [
            "limpa a memória",
            "apaga a memória",
            "esquece tudo",
            "zera o histórico", 
            "apaga o histórico",
            "limpar memória",
            "esquecer conversa"
        ];

        const shouldClear = clearPatterns.some(p => msg.includes(p));

        if (!shouldClear) {
            Logger.warn("⚠️ clear_history bloqueado: usuário não pediu explicitamente.");
            return;
        }

        const historyKey = bot.isGroup ? `${bot.jid}:${bot.senderJid}` : bot.jid;
        lumaHandler.clearHistory(historyKey);
        lumaHandler.clearGroupBuffer?.(bot.jid);
        await bot.reply("🗑️ Minha memória para essa conversa foi apagada.");
    }

    // ==================== HANDLERS DAS FERRAMENTAS ====================

    static async handleToolCalls(bot, toolCalls, lumaHandler, quotedBot = null, toolContext = {}) {
        if (!toolCalls || toolCalls.length === 0) return;

        for (const call of toolCalls) {
            Logger.info(`🔧 Luma acionou a ferramenta: ${call.name}`);
            try {
                switch (call.name) {
                    // 🎵 ÁUDIO
                    case "download_audio":
                        await this.handleDownloadAudio(bot, call.args);
                        break;
                    case "download_video":
                        await this.handleDownloadVideo(bot, call.args);
                        break;

                    // 👥 GRUPO
                    case "tag_everyone":
                        await this.handleTagEveryone(bot);
                        break;
                    case "remove_member":
                        await this.handleRemoveMember(bot, call.args);
                        break;

                    // 🎨 MÍDIA
                    case "create_sticker":
                        await this.handleCreateSticker(bot, quotedBot);
                        break;
                    case "create_image":
                        await this.handleCreateImage(bot, quotedBot);
                        break;
                    case "create_gif":
                        await this.handleCreateGif(bot, quotedBot);
                        break;

                    // 🧠 MEMÓRIA E PERSONALIDADE
                    case "clear_history":
                        if (this.isSummaryRequest(bot.body)) {
                            await this.handleShowSummary(bot, {
                                limit: this.extractSummaryLimit(bot.body),
                            }, toolContext);
                            break;
                        }
                        await this.handleClearHistory(bot, lumaHandler);
                        break;
                    case "change_personality":
                        await this.handleChangePersonality(bot, call.args);
                        break;

                    // 📊 INFORMAÇÕES
                    case "show_help":
                        await this.handleShowHelp(bot);
                        break;
                    case "show_luma_stats":
                        await this.handleShowStats(bot, lumaHandler);
                        break;
                    case "show_rank":
                        await this.handleShowRank(bot, call.args);
                        break;

                    // 🆕 NOVAS FERRAMENTAS (COMANDOS POR CONTEXTO)
                    case "show_my_number":
                        await this.handleShowMyNumber(bot);
                        break;
                    case "summarize_chat":
                        await this.handleSummarizeChat(bot, call.args);
                        break;

                    // ⏰ LEMBRETES
                    case "schedule_reminder":
                        await this.handleScheduleReminder(bot, call.args);
                        break;
                    case "show_personality_menu":
                        await this.handleShowPersonalityMenu(bot);
                        break;
                    case "set_nickname":
                        await this.handleSetNickname(bot, call.args);
                        break;
                    case "show_summary":
                        await this.handleShowSummary(bot, call.args, toolContext);
                        break;

                    default:
                        Logger.warn(`⚠️ Ferramenta desconhecida: ${call.name}`);
                }
            } catch (error) {
                Logger.error(`❌ Erro ao executar ferramenta ${call.name}:`, error);
            }
        }
    }

    // ==================== FERRAMENTAS DE ÁUDIO ====================

    /**
     * 🆕 Baixa áudio de um link de vídeo (MP3)
     * Ativado por: "Luma, baixa esse áudio" (respondendo a um link)
     */
    static async handleDownloadAudio(bot, args) {
        try {
            const url = args?.url || extractUrl(bot.body) || extractUrl(bot.quotedText);
            
            if (!url) {
                await bot.reply('🎵 Me envie um link de vídeo (YouTube, SoundCloud, etc.) para eu baixar o áudio.');
                return;
            }

            try {
                new URL(url);
            } catch {
                await bot.reply('🔗 URL inválida. Me envie um link válido.');
                return;
            }

            await bot.reply(`🎵 Baixando áudio... Isso pode levar alguns segundos.`);
            
            const result = await VideoDownloader.downloadAudio(url);
            
            if (!result?.filePath) {
                await bot.reply('❌ Não consegui baixar o áudio. Verifique o link e tente novamente.');
                return;
            }

            const audioBuffer = fs.readFileSync(result.filePath);
            await bot.sendMessage(bot.jid, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: `${result.title || 'audio'}.mp3`,
            });
            
            DatabaseService.incrementMetric("audios_downloaded");
            await bot.reply('✅ Áudio baixado e enviado com sucesso!');
            
            try { fs.unlinkSync(result.filePath); } catch {}
        } catch (error) {
            Logger.error('❌ Erro ao baixar áudio:', error);
            await bot.reply('❌ Não consegui baixar o áudio. Verifique o link e tente novamente.');
        }
    }

    static async handleDownloadVideo(bot, args) {
        // Implementar se necessário
        await bot.reply("🎬 Download de vídeo ainda não implementado.");
    }

    // ==================== FERRAMENTAS DE GRUPO ====================

    static async handleTagEveryone(bot) {
        if (bot.isGroup) {
            await GroupManager.mentionEveryone(bot.raw, bot.socket);
        } else {
            await bot.reply("⚠️ Eu só consigo marcar todo mundo em grupos, anjo!");
        }
    }

    static async handleRemoveMember(bot, args) {
        if (!bot.isGroup) {
            await bot.reply("⚠️ Eu só consigo remover pessoas de grupos.");
            return;
        }

        const sock = bot.socket;
        const jid = bot.jid;
        const senderJid = bot.raw.key.participant || bot.raw.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(jid);

        const cleanJid = (id) => (id ? id.split(":")[0].split("@")[0].replace(/\D/g, "") : null);
        const senderClean = cleanJid(senderJid);

        const senderIsAdmin = groupMetadata.participants.some((p) => {
            return cleanJid(p.id) === senderClean && p.admin;
        });

        if (!senderIsAdmin) {
            await bot.reply("⚠️ Só administradores do grupo podem me pedir pra remover alguém, anjo!");
            return;
        }

        const target = args?.target || "";
        if (!target) {
            Logger.warn("Alvo não especificado na ferramenta remove_member");
            return;
        }

        await this._executeKick(bot, target);
    }

    static async _executeKick(bot, targetName) {
        const sock = bot.socket;
        const jid = bot.jid;
        const groupMetadata = await sock.groupMetadata(jid);
        const cleanJid = (id) => (id ? id.split(":")[0].split("@")[0].replace(/\D/g, "") : null);
        const senderJid = bot.raw.key.participant || bot.raw.key.remoteJid;

        let targetJid;
        let targetParticipant;
        let wasRandom = false;
        const mentionedJidList = await bot.getMentionedJids();

        if (mentionedJidList.length > 0) {
            targetJid = mentionedJidList[0];
            targetParticipant = groupMetadata.participants.find((p) => p.id === targetJid);
        } else {
            const targetNumber = targetName.replace(/\D/g, "");
            if (targetNumber.length >= 8) {
                targetParticipant = groupMetadata.participants.find((p) => p.id.replace(/\D/g, "").includes(targetNumber));
                if (targetParticipant) targetJid = targetParticipant.id;
            }
        }

        if (!targetParticipant || !targetJid) {
            const selfClean   = cleanJid(sock.user?.id || sock.authState?.creds?.me?.id);
            const senderClean = cleanJid(senderJid);
            const eligible = groupMetadata.participants.filter((p) => {
                const pClean = cleanJid(p.id);
                return !p.admin && pClean !== selfClean && pClean !== senderClean;
            });

            if (eligible.length === 0) {
                await bot.reply('😔 Queria dar um chute em alguém, mas não sobrou ninguém elegível...');
                return;
            }

            const chosen = eligible[Math.floor(Math.random() * eligible.length)];
            targetJid = chosen.id;
            targetParticipant = chosen;
            wasRandom = true;
        }

        const botJid = sock.user?.id || sock.authState?.creds?.me?.id;
        const botLid = sock.user?.lid || sock.authState?.creds?.me?.id;
        const botIdClean = cleanJid(botJid);
        const botLidClean = cleanJid(botLid);

        const botIsAdmin = groupMetadata.participants.find((p) => {
            const pClean = cleanJid(p.id);
            return (pClean === botIdClean || (botLidClean && pClean === botLidClean)) && p.admin;
        });

        if (!botIsAdmin) {
            await bot.reply("⚠️ Eu preciso ser administradora do grupo para expulsar alguém!");
            return;
        }

        if (targetParticipant.admin) {
            await bot.reply("⚠️ Não posso remover outro administrador do grupo.");
            return;
        }

        Logger.info(`Expulsando ${targetJid} do grupo ${jid} via comando natural da Luma.`);
        await sock.groupParticipantsUpdate(jid, [targetJid], "remove");

        const kickMsg = wasRandom
            ? `Já sabia que era você, @${targetJid.split("@")[0]}. Tchau 👋`
            : `✅ Prontinho, @${targetJid.split("@")[0]} foi de arrasta pra cima!`;
        await bot.reply(kickMsg, { mentions: [targetJid] });
    }

    // ==================== HANDLERS DE MÍDIA ====================

    static async handleCreateSticker(bot, quotedBot = null) {
        const quoted = quotedBot || bot.getQuotedAdapter();

        if (bot.innerMessage?.imageMessage || bot.innerMessage?.videoMessage || bot.innerMessage?.stickerMessage) {
            await MediaProcessor.processToSticker(bot.raw, bot.socket);
            DatabaseService.incrementMetric("stickers_created");
            return;
        }
        if (quoted?.hasVisualContent) {
            await MediaProcessor.processToSticker(quoted.raw, bot.socket, bot.jid);
            DatabaseService.incrementMetric("stickers_created");
            return;
        }
        await bot.reply("⚠️ Você precisa responder a uma imagem, vídeo ou GIF para eu fazer a figurinha!");
    }

    static async handleCreateImage(bot, quotedBot = null) {
        const quoted = quotedBot || bot.getQuotedAdapter();

        if (bot.innerMessage?.stickerMessage) {
            await MediaProcessor.processStickerToImage(bot.raw, bot.socket);
            DatabaseService.incrementMetric("images_created");
            return;
        }
        if (quoted?.hasSticker) {
            await MediaProcessor.processStickerToImage(quoted.raw, bot.socket, bot.jid);
            DatabaseService.incrementMetric("images_created");
            return;
        }
        await bot.reply("⚠️ Você precisa responder a uma figurinha (sticker) para eu transformar em imagem!");
    }

    static async handleCreateGif(bot, quotedBot = null) {
        const quoted = quotedBot || bot.getQuotedAdapter();

        if (bot.innerMessage?.stickerMessage) {
            await MediaProcessor.processStickerToGif(bot.raw, bot.socket);
            DatabaseService.incrementMetric("gifs_created");
            return;
        }
        if (quoted?.hasSticker) {
            await MediaProcessor.processStickerToGif(quoted.raw, bot.socket, bot.jid);
            DatabaseService.incrementMetric("gifs_created");
            return;
        }
        await bot.reply("⚠️ Você precisa responder a uma figurinha animada para eu transformar em GIF!");
    }

    // ==================== PERSONALIDADE E MEMÓRIA ====================

    static async handleChangePersonality(bot, args) {
        const key = args?.personality;
        if (!key) {
            Logger.warn("Personalidade não especificada na ferramenta change_personality");
            return;
        }

        const success = PersonalityManager.setPersonality(bot.jid, key);
        if (success) {
            const config = PersonalityManager.getPersonaConfig(bot.jid);
            await bot.reply(`🎭 Personalidade alterada para *${config.name}*!`);
        } else {
            await bot.reply("⚠️ Não conheço essa personalidade. Usa !alma pra ver as opções!");
        }
    }

    static async handleShowHelp(bot) {
        await bot.sendText(MENUS.HELP_TEXT);
    }

    static async handleShowSummary(bot, args, toolContext = {}) {
        const resumoPlugin = toolContext.resumoPlugin;
        if (!resumoPlugin?.showSummary) {
            await bot.reply("Não consegui acessar o histórico recente para resumir agora.");
            return;
        }
        await resumoPlugin.showSummary(bot, { limit: args?.limit });
    }

    // ==================== 🆕 NOVAS FERRAMENTAS (COMANDOS POR CONTEXTO) ====================

    /**
     * 🆕 Mostra o número e ID do usuário que está falando
     * Ativado por: "Luma, qual é o meu número?" ou "Luma, me mostra meu ID"
     */
    static async handleShowMyNumber(bot) {
        try {
            const senderJid = bot.senderJid || bot.sender;
            const number = senderJid?.replace(/@s\.whatsapp\.net$/, '').replace(/@lid$/, '') || 'Não disponível';
            
            let response = `📱 **Informações do seu usuário:**\n\n`;
            response += `👤 **Número:** ${number}\n`;
            response += `🆔 **ID (JID):** ${senderJid}\n`;
            
            try {
                const userInfo = await bot.getUserInfo?.(senderJid);
                if (userInfo?.pushName) {
                    response += `📛 **Nome:** ${userInfo.pushName}\n`;
                }
            } catch (e) {}
            
            if (bot.isGroup) {
                const groupMetadata = await bot.socket.groupMetadata(bot.jid);
                const participant = groupMetadata.participants.find(p => p.id === senderJid);
                if (participant?.admin) {
                    response += `👑 **Cargo:** Administrador\n`;
                }
            }
            
            response += `\n💡 Use \`!nick\` para definir um apelido personalizado.`;
            await bot.reply(response);
        } catch (error) {
            Logger.error('❌ Erro ao mostrar número:', error);
            await bot.reply('❌ Não consegui buscar seu número agora. Tente novamente.');
        }
    }

    /**
     * 🆕 Gera um resumo da conversa atual
     * Ativado por: "Luma, resume a conversa" ou "Luma, me dá um resumo"
     */
    static async handleSummarizeChat(bot, args) {
        try {
            const limit = args?.limit || 15;
            
            // Verificar se o ResumoPlugin está disponível via toolContext
            const resumoPlugin = bot.resumoPlugin;
            if (resumoPlugin?.showSummary) {
                await resumoPlugin.showSummary(bot, { limit });
                return;
            }
            
            // Fallback: tentar usar o handler já existente
            await this.handleShowSummary(bot, { limit });
        } catch (error) {
            Logger.error('❌ Erro ao gerar resumo:', error);
            await bot.reply('❌ Não consegui gerar o resumo agora. Tente novamente.');
        }
    }

    // ==================== AUXILIARES ====================

    static isSummaryRequest(text) {
        const normalized = this.normalizeText(text);
        return /\b(resumo|resumir|resume|resuma|sintese|sintetiza|sintetizar)\b/.test(normalized);
    }

    static extractSummaryLimit(text) {
        const normalized = this.normalizeText(text);
        const match = normalized.match(/\b(?:ultimas?|ultimos?|resumo|resume|resuma|resumir)\s+(\d{1,3})\b/);
        if (!match) return null;
        return parseInt(match[1], 10);
    }

    static normalizeText(text) {
        return String(text || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[!?.,:;]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    static async handleShowRank(bot, args) {
        const scope = this.resolveRankScope(bot);
        const target = String(args?.target || "").trim();

        let targetJid = null;
        let targetName = null;

        if (/^(eu|me|self|myself)$/i.test(target)) {
            targetJid = bot.senderJid;
        } else if (target) {
            const mentioned = await this.getActionTargetMentions(bot);
            targetJid = mentioned[0] ?? null;
            targetName = target;
        }

        await RankPlugin.showRanking(bot, { scope, targetJid, targetName });
    }

    static resolveRankScope(bot) {
        if (!bot.isGroup) return "global";

        const normalized = String(bot.body || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[!?.,:;]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const explicitlyGroup =
            /\b(rank|ranking)\b.*\b(do|desse|deste)\s+grupo\b/.test(normalized) ||
            /\b(rank|ranking)\s+(daqui|local)\b/.test(normalized) ||
            /\b(manda|mostra|envia|exibe)\s+o\s+(do|desse|deste)\s+grupo\b/.test(normalized);

        if (explicitlyGroup) return "group";

        const conciseGlobalFollowUp =
            /^(?:luma\s+)?(?:(?:mas\s+)?e\s+)?(?:(?:quero\s+ver|mostra|manda|envia|exibe|cade)(?:\s+(?:o|no|na))?\s+)?(?:(?:o|no|na)\s+)?(?:(?:rank|ranking)\s+)?(?:geral|global)(?:\s+luma)?$/.test(normalized);

        const explicitlyGlobal =
            /\b(rank|ranking)\s+(global|geral)\b/.test(normalized) ||
            /\b(global|geral)\s+(rank|ranking)\b/.test(normalized) ||
            /\b(rank|ranking)\b.*\b(todos os chats|todos os grupos|geral de todos)\b/.test(normalized) ||
            conciseGlobalFollowUp;

        return explicitlyGlobal ? "global" : "group";
    }

    static async handleSetNickname(bot, args) {
        const target = String(args?.target || "").trim().toLowerCase();
        let targetJid = bot.senderJid;

        if (target === "mentioned_user") {
            const mentioned = await this.getActionTargetMentions(bot);
            if (!mentioned.length) {
                await bot.reply("⚠️ Marca a pessoa cujo apelido você quer alterar.");
                return;
            }
            targetJid = mentioned[0];
        } else if (target !== "self") {
            Logger.warn("Alvo inválido na ferramenta set_nickname");
            return;
        }

        await UserPlugin.setNickname(bot, {
            nickname: args?.nickname,
            targetJid,
        });
    }

    static async getActionTargetMentions(bot) {
        const mentioned = await bot.getMentionedJids();
        const me = bot.socket?.authState?.creds?.me;
        const clean = (jid) => String(jid || "").split(":")[0].split("@")[0].replace(/\D/g, "");
        const ownIds = new Set([
            clean(me?.id || bot.socket?.user?.id),
            clean(me?.lid),
        ].filter(Boolean));

        return mentioned.filter((jid) => !ownIds.has(clean(jid)));
    }

    static async handleScheduleReminder(bot, args) {
        const text = args?.reminder_text || args?.text;
        const datetime = args?.datetime;
        if (!text || !datetime) {
            await bot.reply("⚠️ Preciso saber o que lembrar e quando, anjo!");
            return;
        }

        const mentioned = await bot.getMentionedJids();
        const creator = bot.senderJid;
        const mentionJids = mentioned.length > 0 ? mentioned : [creator];

        try {
            const { fireAt } = ReminderService.schedule({
                chatJid: bot.jid,
                isGroup: bot.isGroup,
                creatorJid: creator,
                mentionJids,
                text,
                datetime,
            });
            const when = new Date(fireAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                dateStyle: "short",
                timeStyle: "short",
            });
            await bot.reply(`⏰ Anotado! Te lembro disso em ${when}.`);
        } catch (error) {
            Logger.error("Erro ao agendar lembrete:", error);
            await bot.reply(`⚠️ Não consegui agendar: ${error.message}`);
        }
    }

    static async handleShowStats(bot, lumaHandler) {
        const dbStats  = DatabaseService.getMetrics();
        const memStats = lumaHandler?.getStats?.() ?? { totalConversations: 0 };

        const text =
            `📊 *Estatísticas Globais da Luma*\n\n` +
            `🧠 *Inteligência Artificial:*\n` +
            `• Respostas Geradas: ${dbStats.ai_responses || 0}\n` +
            `• Conversas Ativas (RAM): ${memStats.totalConversations}\n\n` +
            `🎨 *Mídia Gerada:*\n` +
            `• Figurinhas: ${dbStats.stickers_created || 0}\n` +
            `• Imagens: ${dbStats.images_created || 0}\n` +
            `• GIFs: ${dbStats.gifs_created || 0}\n` +
            `• Vídeos Baixados: ${dbStats.videos_downloaded || 0}\n\n` +
            `📈 *Total de Interações:* ${dbStats.total_messages || 0}`;

        await bot.sendText(text);
    }

    static async handleShowPersonalityMenu(bot) {
        const list        = PersonalityManager.getList();
        const currentName = PersonalityManager.getActiveName(bot.jid);

        let text = `${MENUS.PERSONALITY.HEADER}\n`;
        text += `🔹 Atual neste chat: ${currentName}\n\n`;

        list.forEach((p, i) => {
            const isDefault = p.key === LUMA_CONFIG.DEFAULT_PERSONALITY ? " ⭐ (Padrão)" : "";
            text += `p${i + 1} - ${p.name}${isDefault}\n${p.desc}\n\n`;
        });

        text += MENUS.PERSONALITY.FOOTER;
        await bot.sendText(text);
    }
}
