# Graph Report - .  (2026-05-02)

## Corpus Check
- 107 files · ~57,109 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 784 nodes · 912 edges · 89 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AI Provider Core|AI Provider Core]]
- [[_COMMUNITY_Architecture Documentation|Architecture Documentation]]
- [[_COMMUNITY_BaileysAdapter Methods|BaileysAdapter Methods]]
- [[_COMMUNITY_LumaHandler Pipeline|LumaHandler Pipeline]]
- [[_COMMUNITY_Bootstrap and DI Wiring|Bootstrap and DI Wiring]]
- [[_COMMUNITY_Dashboard Frontend|Dashboard Frontend]]
- [[_COMMUNITY_MessagingPort Contract|MessagingPort Contract]]
- [[_COMMUNITY_AI Core Concepts|AI Core Concepts]]
- [[_COMMUNITY_Audio and Download Plugins|Audio and Download Plugins]]
- [[_COMMUNITY_WhatsApp Connection Flow|WhatsApp Connection Flow]]
- [[_COMMUNITY_Download Plugin Logic|Download Plugin Logic]]
- [[_COMMUNITY_Dashboard API Server|Dashboard API Server]]
- [[_COMMUNITY_ToolDispatcher Commands|ToolDispatcher Commands]]
- [[_COMMUNITY_Media Processor|Media Processor]]
- [[_COMMUNITY_SQLite Storage Adapter|SQLite Storage Adapter]]
- [[_COMMUNITY_InMemory Storage Adapter|InMemory Storage Adapter]]
- [[_COMMUNITY_Gemini Adapter|Gemini Adapter]]
- [[_COMMUNITY_BaileysAdapter and Group Utils|BaileysAdapter and Group Utils]]
- [[_COMMUNITY_Spontaneous Handler|Spontaneous Handler]]
- [[_COMMUNITY_LumaPlugin Behavior|LumaPlugin Behavior]]
- [[_COMMUNITY_Reconnection Policy|Reconnection Policy]]
- [[_COMMUNITY_StoragePort Contract|StoragePort Contract]]
- [[_COMMUNITY_ConversationHistory|ConversationHistory]]
- [[_COMMUNITY_AudioTranscriber Service|AudioTranscriber Service]]
- [[_COMMUNITY_Database Documentation|Database Documentation]]
- [[_COMMUNITY_DI Container|DI Container]]
- [[_COMMUNITY_Plugin Manager|Plugin Manager]]
- [[_COMMUNITY_Tavily Search Adapter|Tavily Search Adapter]]
- [[_COMMUNITY_OpenAI Adapter|OpenAI Adapter]]
- [[_COMMUNITY_Database Service|Database Service]]
- [[_COMMUNITY_Video Downloader|Video Downloader]]
- [[_COMMUNITY_Resumo Plugin|Resumo Plugin]]
- [[_COMMUNITY_Video Converter|Video Converter]]
- [[_COMMUNITY_WebSearch Service|WebSearch Service]]
- [[_COMMUNITY_Personality Manager|Personality Manager]]
- [[_COMMUNITY_Plugin Builder Helpers|Plugin Builder Helpers]]
- [[_COMMUNITY_FileSystem Utilities|FileSystem Utilities]]
- [[_COMMUNITY_Logger|Logger]]
- [[_COMMUNITY_Gemini Transcriber Adapter|Gemini Transcriber Adapter]]
- [[_COMMUNITY_Image Processor|Image Processor]]
- [[_COMMUNITY_Media Engine Documentation|Media Engine Documentation]]
- [[_COMMUNITY_Bot Entry Point|Bot Entry Point]]
- [[_COMMUNITY_JidQueue Class|JidQueue Class]]
- [[_COMMUNITY_AIPort Contract|AIPort Contract]]
- [[_COMMUNITY_GroupService|GroupService]]
- [[_COMMUNITY_SpontaneousPlugin|SpontaneousPlugin]]
- [[_COMMUNITY_Google Grounding Adapter|Google Grounding Adapter]]
- [[_COMMUNITY_ResumoPlugin Test Helpers|ResumoPlugin Test Helpers]]
- [[_COMMUNITY_PluginManager Test Helpers|PluginManager Test Helpers]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_CommandRouter and Dispatch|CommandRouter and Dispatch]]
- [[_COMMUNITY_Group Manager|Group Manager]]
- [[_COMMUNITY_SearchPort Contract|SearchPort Contract]]
- [[_COMMUNITY_TranscriberPort Contract|TranscriberPort Contract]]
- [[_COMMUNITY_CommandRouter Detect|CommandRouter Detect]]
- [[_COMMUNITY_GroupTools Plugin|GroupTools Plugin]]
- [[_COMMUNITY_Utils Plugin|Utils Plugin]]
- [[_COMMUNITY_Exif Utility|Exif Utility]]
- [[_COMMUNITY_Ports Contract Tests|Ports Contract Tests]]
- [[_COMMUNITY_GroupService Test Helpers|GroupService Test Helpers]]
- [[_COMMUNITY_OpenAI Tool Conversion|OpenAI Tool Conversion]]
- [[_COMMUNITY_Bot Initializer|Bot Initializer]]
- [[_COMMUNITY_BaileysAdapter Reply Methods|BaileysAdapter Reply Methods]]
- [[_COMMUNITY_Tavily Search Logic|Tavily Search Logic]]
- [[_COMMUNITY_Socket and Reconnection|Socket and Reconnection]]
- [[_COMMUNITY_FileSystem Dir Operations|FileSystem Dir Operations]]
- [[_COMMUNITY_FileSystem Cleanup|FileSystem Cleanup]]
- [[_COMMUNITY_VideoDownloader Tests|VideoDownloader Tests]]
- [[_COMMUNITY_MessageUtils Tests|MessageUtils Tests]]
- [[_COMMUNITY_BaileysSocketFactory Tests|BaileysSocketFactory Tests]]
- [[_COMMUNITY_Stop Bot|Stop Bot]]
- [[_COMMUNITY_Changelog|Changelog]]
- [[_COMMUNITY_Audio Download Changelog|Audio Download Changelog]]
- [[_COMMUNITY_BaileysAdapter React|BaileysAdapter React]]
- [[_COMMUNITY_BaileysAdapter Reply Check|BaileysAdapter Reply Check]]
- [[_COMMUNITY_GeminiAdapter Search Port|GeminiAdapter Search Port]]
- [[_COMMUNITY_OpenAI Media Processing|OpenAI Media Processing]]
- [[_COMMUNITY_GoogleGrounding Search|GoogleGrounding Search]]
- [[_COMMUNITY_SQLite History Query|SQLite History Query]]
- [[_COMMUNITY_SQLite Message Save|SQLite Message Save]]
- [[_COMMUNITY_InMemory Clear|InMemory Clear]]
- [[_COMMUNITY_Env Key Warning|Env Key Warning]]
- [[_COMMUNITY_Menu Constants|Menu Constants]]
- [[_COMMUNITY_Message Constants|Message Constants]]
- [[_COMMUNITY_Baileys Session Prep|Baileys Session Prep]]
- [[_COMMUNITY_Exif Class|Exif Class]]
- [[_COMMUNITY_Exif Write Method|Exif Write Method]]
- [[_COMMUNITY_FileSystem Class|FileSystem Class]]
- [[_COMMUNITY_Logger Debug|Logger Debug]]

## God Nodes (most connected - your core abstractions)
1. `BaileysAdapter` - 32 edges
2. `MessagingPort` - 25 edges
3. `Dashboard` - 25 edges
4. `LumaHandler` - 23 edges
5. `LUMA_CONFIG` - 14 edges
6. `ToolDispatcher` - 12 edges
7. `ConnectionManager` - 11 edges
8. `SQLiteStorageAdapter` - 11 edges
9. `MediaProcessor` - 10 edges
10. `InMemoryStorageAdapter` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Vitest Config` --references--> `LumaBot Project`  [INFERRED]
  vitest.config.js → CLAUDE.md
- `LUMA_STATUS/LUMA_QR stdout protocol` --references--> `LumaBot Project`  [EXTRACTED]
  dashboard/server.js → CLAUDE.md
- `Facade Pattern (BaileysAdapter)` --references--> `BaileysAdapter`  [EXTRACTED]
  docs/01-Arquitetura.md → src/adapters/BaileysAdapter.js
- `v6.1.0 Auto-Deploy Dashboard` --references--> `runDeploy`  [EXTRACTED]
  docs/CHANGELOG.md → dashboard/server.js
- `Multimodal Vision Pipeline` --references--> `BaileysAdapter.quotedHasVisualContent`  [EXTRACTED]
  docs/02-nucleo-ia.md → src/adapters/BaileysAdapter.js

## Hyperedges (group relationships)
- **AI Provider Swap via Environment Variable** — geminiadapter_geminiadapter, openaiadapter_openaiadapter, env_env [EXTRACTED 1.00]
- **Web Search Fallback Chain (Tavily → GoogleGrounding)** — tavilyadapter_tavilyadapter, googlegroundingadapter_googlegroundingadapter, geminiadapter_handlesearchturn [EXTRACTED 1.00]
- **Dual Database Pattern (Public Metrics + Private Data)** — sqlitestorageadapter_sqlitestorageadapter, db_metrics_public, db_private [EXTRACTED 1.00]
- **Hexagonal Ports: AI, Search, Storage, Transcriber abstractions** — aiport_aiport, searchport_searchport, storageport_storageport, transcriberport_transcriberport [INFERRED 0.95]
- **Luma AI Response Pipeline: prompt building, history, AI call, tool dispatch** — promptbuilder_build_prompt_request, conversationhistory_conversation_history, lumahandler_luma_handler, tooldispatcher_tool_dispatcher [EXTRACTED 0.95]
- **Message Routing Chain: Router → Queue → Handler → Plugin dispatch** — messagerouter_route_messages, jidqueue_jid_queue, messagehandler_message_handler, commandrouter_command_router [EXTRACTED 0.95]
- **Plugin Dispatch Pattern: PluginManager routes commands to all registered plugins** — pluginManager_PluginManager, lumaPlugin_LumaPlugin, mediaPlugin_MediaPlugin, downloadPlugin_DownloadPlugin, groupToolsPlugin_GroupToolsPlugin, spontaneousPlugin_SpontaneousPlugin, utilsPlugin_UtilsPlugin, resumoPlugin_ResumoPlugin, audioDownloadPlugin_AudioDownloadPlugin [INFERRED 0.95]
- **Metric Tracking Pattern: Plugins increment DatabaseService metrics after actions** — downloadPlugin_DownloadPlugin, audioDownloadPlugin_AudioDownloadPlugin, mediaPlugin_MediaPlugin, lumaPlugin_LumaPlugin, database_DatabaseService [EXTRACTED 1.00]
- **Dashboard Status Flow: QrCodePresenter stdout signals consumed by Dashboard via WebSocket** — qrcodePresenter_presentQrCode, connectionManager_ConnectionManager, dashboard_Dashboard, dashboardHtml_dashboardPage [INFERRED 0.85]
- **Web Search Fallback Chain: Tavily → Google Grounding** — websearchservice_websearchservice, tavilyadapter_tavilyadapter, googlegroundingadapter_googlegroundingadapter [INFERRED 0.95]
- **AI Adapter Contract Suite (GeminiAdapter + OpenAIAdapter implement AIPort)** — test_aiadaptercontract, geminiadapter_geminiadapter, openaiadapter_openaiadapter, aiport_aiport [EXTRACTED 1.00]
- **Port Contract Test Coverage (all ports tested in one suite)** — test_portscontract, aiport_aiport, messagingport_messagingport, storageport_storageport, searchport_searchport, transcriberport_transcriberport [EXTRACTED 1.00]
- **Message Processing Pipeline: Router → Adapter → Handler → Plugins** — messagerouter_infra, baileysadapter_adapter, messagehandler_handler, pluginmanager_plugin, jidqueue_infra [EXTRACTED 1.00]
- **DI Wiring: Bootstrap creates Container registering all ports** — bootstrap_infra, container_infra, gemini_adapter, openai_adapter [EXTRACTED 1.00]
- **AI Provider Selection: Factory picks Gemini/OpenAI/DeepSeek by env config** — aiprovider_factory, gemini_adapter, openai_adapter, websearch_service [EXTRACTED 1.00]

## Communities

### Community 0 - "AI Provider Core"
Cohesion: 0.06
Nodes (53): AIPort, createAIProvider, _wrapOpenAIAdapter, AudioTranscriber, createContainer, CommandRouter, Container, ConversationHistory (+45 more)

### Community 1 - "Architecture Documentation"
Cohesion: 0.05
Nodes (42): Multimodal Vision Pipeline, Adapters Layer, Core Layer (Domain Pure), Architecture Documentation, Facade Pattern (BaileysAdapter), Infra Layer, Plugins Layer, ReconnectionPolicy Decision Module (+34 more)

### Community 2 - "BaileysAdapter Methods"
Cohesion: 0.07
Nodes (1): BaileysAdapter

### Community 3 - "LumaHandler Pipeline"
Cohesion: 0.11
Nodes (6): LumaHandler, createAIProvider(), _wrapOpenAIAdapter(), buildPromptRequest(), cleanResponseText(), splitIntoParts()

### Community 4 - "Bootstrap and DI Wiring"
Cohesion: 0.1
Nodes (31): AIProviderFactory - createAIProvider, AIProviderFactory Test - createAIProvider, Bootstrap - createContainer, Bootstrap Test - createContainer, CONFIG constants, Container (DI), Container Test, ConversationHistory (+23 more)

### Community 5 - "Dashboard Frontend"
Cohesion: 0.13
Nodes (3): authHeader(), Dashboard, tokenParam()

### Community 6 - "MessagingPort Contract"
Cohesion: 0.08
Nodes (1): MessagingPort

### Community 7 - "AI Core Concepts"
Cohesion: 0.11
Nodes (26): AI Core Documentation, Group Context Buffer, History Key Strategy (groupJid:senderJid), Model Fallback System, Personality System, Prompt Structure (Sandwich), Spontaneous Interaction System, Web Search Provider Strategy (+18 more)

### Community 8 - "Audio and Download Plugins"
Cohesion: 0.13
Nodes (23): AudioDownloadPlugin, AudioTranscriber, barba-init (SPA transitions), ConnectionManager, Dashboard Page (HTML), Dashboard (frontend class), Dashboard API (frontend), DatabaseService (+15 more)

### Community 9 - "WhatsApp Connection Flow"
Cohesion: 0.22
Nodes (5): createBaileysSocket(), prepareBaileysSession(), _loadQrCodeTerminal(), presentQrCode(), ConnectionManager

### Community 10 - "Download Plugin Logic"
Cohesion: 0.16
Nodes (5): AudioDownloadPlugin, DownloadPlugin, MediaPlugin, extractUrl(), getMessageType()

### Community 11 - "Dashboard API Server"
Cohesion: 0.24
Nodes (13): authMiddleware(), broadcast(), getToken(), handleQRSignal(), handleStatusSignal(), parseLevel(), pushLog(), restartBot() (+5 more)

### Community 12 - "ToolDispatcher Commands"
Cohesion: 0.28
Nodes (1): ToolDispatcher

### Community 13 - "Media Processor"
Cohesion: 0.36
Nodes (2): MediaProcessor, sendText()

### Community 14 - "SQLite Storage Adapter"
Cohesion: 0.18
Nodes (1): SQLiteStorageAdapter

### Community 15 - "InMemory Storage Adapter"
Cohesion: 0.18
Nodes (1): InMemoryStorageAdapter

### Community 16 - "Gemini Adapter"
Cohesion: 0.31
Nodes (1): GeminiAdapter

### Community 17 - "BaileysAdapter and Group Utils"
Cohesion: 0.25
Nodes (11): BaileysAdapter, GroupService, GroupService Test, JidQueue, JidQueue Test, Logger, MessageHandler, MessageRouter - routeMessages (+3 more)

### Community 18 - "Spontaneous Handler"
Cohesion: 0.33
Nodes (1): SpontaneousHandler

### Community 19 - "LumaPlugin Behavior"
Cohesion: 0.31
Nodes (1): LumaPlugin

### Community 20 - "Reconnection Policy"
Cohesion: 0.25
Nodes (1): ReconnectionPolicy

### Community 21 - "StoragePort Contract"
Cohesion: 0.22
Nodes (1): StoragePort

### Community 22 - "ConversationHistory"
Cohesion: 0.22
Nodes (1): ConversationHistory

### Community 23 - "AudioTranscriber Service"
Cohesion: 0.36
Nodes (1): AudioTranscriber

### Community 24 - "Database Documentation"
Cohesion: 0.22
Nodes (9): Database Documentation, Dual Database Strategy, Public Metrics DB (luma_metrics.sqlite), Private Data DB (luma_private.sqlite), InMemoryStorageAdapter, SQLiteStorageAdapter.getPersonality, SQLiteStorageAdapter.incrementMetric, SQLiteStorageAdapter._migrate (+1 more)

### Community 25 - "DI Container"
Cohesion: 0.32
Nodes (1): Container

### Community 26 - "Plugin Manager"
Cohesion: 0.25
Nodes (1): PluginManager

### Community 27 - "Tavily Search Adapter"
Cohesion: 0.36
Nodes (1): TavilyAdapter

### Community 28 - "OpenAI Adapter"
Cohesion: 0.29
Nodes (1): OpenAIAdapter

### Community 29 - "Database Service"
Cohesion: 0.25
Nodes (1): DatabaseService

### Community 30 - "Video Downloader"
Cohesion: 0.39
Nodes (1): VideoDownloader

### Community 32 - "Resumo Plugin"
Cohesion: 0.38
Nodes (2): RESUMO_PROMPT(), ResumoPlugin

### Community 33 - "Video Converter"
Cohesion: 0.48
Nodes (1): VideoConverter

### Community 34 - "WebSearch Service"
Cohesion: 0.48
Nodes (1): WebSearchService

### Community 36 - "Personality Manager"
Cohesion: 0.4
Nodes (1): PersonalityManager

### Community 37 - "Plugin Builder Helpers"
Cohesion: 0.47
Nodes (3): buildAudioTranscriber(), buildPluginManager(), MessageHandler

### Community 38 - "FileSystem Utilities"
Cohesion: 0.33
Nodes (1): FileSystem

### Community 39 - "Logger"
Cohesion: 0.33
Nodes (1): Logger

### Community 40 - "Gemini Transcriber Adapter"
Cohesion: 0.47
Nodes (1): GeminiTranscriberAdapter

### Community 41 - "Image Processor"
Cohesion: 0.33
Nodes (1): ImageProcessor

### Community 43 - "Media Engine Documentation"
Cohesion: 0.4
Nodes (5): Center Crop Algorithm (scale+crop), Media Engine Documentation, Social Video Download Pipeline, Sticker Creation Pipeline, Video to Sticker Pipeline

### Community 44 - "Bot Entry Point"
Cohesion: 0.67
Nodes (2): BotInitializer, initializeBot()

### Community 45 - "JidQueue Class"
Cohesion: 0.5
Nodes (1): JidQueue

### Community 46 - "AIPort Contract"
Cohesion: 0.5
Nodes (1): AIPort

### Community 47 - "GroupService"
Cohesion: 0.5
Nodes (1): GroupService

### Community 48 - "SpontaneousPlugin"
Cohesion: 0.5
Nodes (1): SpontaneousPlugin

### Community 50 - "Google Grounding Adapter"
Cohesion: 0.5
Nodes (1): GoogleGroundingAdapter

### Community 51 - "ResumoPlugin Test Helpers"
Cohesion: 0.67
Nodes (2): makeBot(), seedMessages()

### Community 52 - "PluginManager Test Helpers"
Cohesion: 0.5
Nodes (2): BazPlugin, FooPlugin

### Community 53 - "Project Overview"
Cohesion: 0.5
Nodes (4): v6.3.0 JidQueue Parallel Processing, JidQueue Concurrency Strategy, Luma Virtual Assistant Persona, LumaBot README

### Community 54 - "CommandRouter and Dispatch"
Cohesion: 0.67
Nodes (4): CommandRouter, CommandRouter Test - detect, PluginManager, PluginManager Test

### Community 55 - "Group Manager"
Cohesion: 0.67
Nodes (1): GroupManager

### Community 56 - "SearchPort Contract"
Cohesion: 0.67
Nodes (1): SearchPort

### Community 57 - "TranscriberPort Contract"
Cohesion: 0.67
Nodes (1): TranscriberPort

### Community 58 - "CommandRouter Detect"
Cohesion: 0.67
Nodes (1): CommandRouter

### Community 59 - "GroupTools Plugin"
Cohesion: 0.67
Nodes (1): GroupToolsPlugin

### Community 60 - "Utils Plugin"
Cohesion: 0.67
Nodes (1): UtilsPlugin

### Community 61 - "Exif Utility"
Cohesion: 0.67
Nodes (1): Exif

### Community 62 - "Ports Contract Tests"
Cohesion: 0.67
Nodes (2): MeuAdapter, MinhaIA

### Community 64 - "GroupService Test Helpers"
Cohesion: 1.0
Nodes (2): makeBot(), makeParticipants()

### Community 71 - "OpenAI Tool Conversion"
Cohesion: 0.67
Nodes (3): OpenAIAdapter.#convertTools, OpenAIAdapter.generateContent, OpenAIAdapter.#normalizeSchema

### Community 84 - "Bot Initializer"
Cohesion: 1.0
Nodes (2): BotInitializer, initializeBot

### Community 85 - "BaileysAdapter Reply Methods"
Cohesion: 1.0
Nodes (2): BaileysAdapter.reply, BaileysAdapter.sendText

### Community 86 - "Tavily Search Logic"
Cohesion: 1.0
Nodes (2): TavilyAdapter.search, TavilyAdapter._searchTavily

### Community 87 - "Socket and Reconnection"
Cohesion: 1.0
Nodes (2): createBaileysSocket, ReconnectionPolicy

### Community 88 - "FileSystem Dir Operations"
Cohesion: 1.0
Nodes (2): FileSystem.ensureDir, FileSystem.removeDir

### Community 89 - "FileSystem Cleanup"
Cohesion: 1.0
Nodes (2): FileSystem.cleanupDir, FileSystem.cleanupFiles

### Community 90 - "VideoDownloader Tests"
Cohesion: 1.0
Nodes (2): VideoDownloader Unit Tests, VideoDownloader

### Community 91 - "MessageUtils Tests"
Cohesion: 1.0
Nodes (2): MessageUtils Test - getMessageType, extractUrl, MessageUtils - getMessageType, extractUrl

### Community 92 - "BaileysSocketFactory Tests"
Cohesion: 1.0
Nodes (2): BaileysSocketFactory, BaileysSocketFactory Test

### Community 108 - "Stop Bot"
Cohesion: 1.0
Nodes (1): stopBot

### Community 109 - "Changelog"
Cohesion: 1.0
Nodes (1): Changelog

### Community 110 - "Audio Download Changelog"
Cohesion: 1.0
Nodes (1): v6.2.0 Audio Download Plugin

### Community 111 - "BaileysAdapter React"
Cohesion: 1.0
Nodes (1): BaileysAdapter.react

### Community 112 - "BaileysAdapter Reply Check"
Cohesion: 1.0
Nodes (1): BaileysAdapter.isRepliedToMe

### Community 113 - "GeminiAdapter Search Port"
Cohesion: 1.0
Nodes (1): GeminiAdapter.setSearchPort

### Community 114 - "OpenAI Media Processing"
Cohesion: 1.0
Nodes (1): OpenAIAdapter.processMedia

### Community 115 - "GoogleGrounding Search"
Cohesion: 1.0
Nodes (1): GoogleGroundingAdapter.search

### Community 116 - "SQLite History Query"
Cohesion: 1.0
Nodes (1): SQLiteStorageAdapter.getConversationHistory

### Community 117 - "SQLite Message Save"
Cohesion: 1.0
Nodes (1): SQLiteStorageAdapter.saveMessage

### Community 118 - "InMemory Clear"
Cohesion: 1.0
Nodes (1): InMemoryStorageAdapter.clear

### Community 119 - "Env Key Warning"
Cohesion: 1.0
Nodes (1): warnIfNoAIKey

### Community 120 - "Menu Constants"
Cohesion: 1.0
Nodes (1): MENUS constants

### Community 121 - "Message Constants"
Cohesion: 1.0
Nodes (1): MESSAGES constants

### Community 122 - "Baileys Session Prep"
Cohesion: 1.0
Nodes (1): prepareBaileysSession

### Community 123 - "Exif Class"
Cohesion: 1.0
Nodes (1): Exif

### Community 124 - "Exif Write Method"
Cohesion: 1.0
Nodes (1): Exif.writeExif

### Community 125 - "FileSystem Class"
Cohesion: 1.0
Nodes (1): FileSystem

### Community 126 - "Logger Debug"
Cohesion: 1.0
Nodes (1): Logger.debug

## Knowledge Gaps
- **98 isolated node(s):** `MinhaIA`, `MeuAdapter`, `FooPlugin`, `BazPlugin`, `BotInitializer` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `BaileysAdapter Methods`** (33 nodes): `BaileysAdapter`, `.audioMimeType()`, `.body()`, `.constructor()`, `.getMentionedJids()`, `.getQuotedAdapter()`, `.getSenderNumber()`, `.hasAudio()`, `.hasMedia()`, `.hasSticker()`, `.hasVisualContent()`, `.innerMessage()`, `.isFromMe()`, `.isGroup()`, `.isRepliedToMe()`, `.jid()`, `.quotedAudioMimeType()`, `.quotedHasAudio()`, `.quotedHasVisualContent()`, `.quotedMessage()`, `.quotedSenderName()`, `.quotedText()`, `.raw()`, `.react()`, `.reply()`, `.senderJid()`, `.senderName()`, `.sendMessage()`, `.sendPresence()`, `.sendText()`, `.socket()`, `.unwrapMessage()`, `BaileysAdapter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MessagingPort Contract`** (26 nodes): `MessagingPort`, `.audioMimeType()`, `.body()`, `.getMentionedJids()`, `.getQuotedAdapter()`, `.getSenderNumber()`, `.hasAudio()`, `.hasMedia()`, `.hasSticker()`, `.hasVisualContent()`, `.isFromMe()`, `.isGroup()`, `.isRepliedToMe()`, `.jid()`, `.quotedAudioMimeType()`, `.quotedHasAudio()`, `.quotedText()`, `.raw()`, `.react()`, `.reply()`, `.senderName()`, `.sendMessage()`, `.sendPresence()`, `.sendText()`, `.socket()`, `MessagingPort.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ToolDispatcher Commands`** (13 nodes): `ToolDispatcher`, `._executeKick()`, `.handleChangePersonality()`, `.handleClearHistory()`, `.handleCreateGif()`, `.handleCreateImage()`, `.handleCreateSticker()`, `.handleRemoveMember()`, `.handleShowHelp()`, `.handleShowPersonalityMenu()`, `.handleTagEveryone()`, `.handleToolCalls()`, `ToolDispatcher.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Media Processor`** (12 nodes): `MediaProcessor`, `.createAndSendGif()`, `.downloadMedia()`, `.extractFrames()`, `.processAnimatedSticker()`, `.processStickerToGif()`, `.processStickerToImage()`, `.processToSticker()`, `.processUrlToSticker()`, `.tryAlternativeMethod()`, `sendText()`, `MediaProcessor.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SQLite Storage Adapter`** (12 nodes): `SQLiteStorageAdapter.js`, `SQLiteStorageAdapter`, `.clearHistory()`, `.close()`, `.constructor()`, `.getConversationHistory()`, `.getMetrics()`, `.getPersonality()`, `.incrementMetric()`, `._migrate()`, `.saveMessage()`, `.setPersonality()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `InMemory Storage Adapter`** (11 nodes): `InMemoryStorageAdapter.js`, `InMemoryStorageAdapter`, `.clear()`, `.clearHistory()`, `.getConversationHistory()`, `.getMetrics()`, `.getPersonality()`, `.incrementMetric()`, `.saveMessage()`, `.setPersonality()`, `.size()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Gemini Adapter`** (11 nodes): `GeminiAdapter`, `._callModel()`, `.constructor()`, `._extractFromResponse()`, `.generateContent()`, `.getStats()`, `._handleSearchTurn()`, `._initStats()`, `._logError()`, `.setSearchPort()`, `GeminiAdapter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Spontaneous Handler`** (10 nodes): `SpontaneousHandler`, `.#getEffectiveChance()`, `.handle()`, `.#pickType()`, `.#randomEmoji()`, `.#sendPartsQuoted()`, `.#sendPartsStandalone()`, `.#shouldTrigger()`, `.trackActivity()`, `SpontaneousHandler.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LumaPlugin Behavior`** (10 nodes): `LumaPlugin`, `.#addToGroupBuffer()`, `.constructor()`, `.#getGroupContext()`, `.#handleMenuReply()`, `.onCommand()`, `.onMessage()`, `.#sendPersonalityMenu()`, `.#sendStats()`, `LumaPlugin.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Reconnection Policy`** (9 nodes): `ReconnectionPolicy`, `.constructor()`, `.decide()`, `.isAuthenticationError()`, `.isAuthError()`, `.markCleanTime()`, `.nextReconnectDelay()`, `.resetAttempts()`, `ReconnectionPolicy.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `StoragePort Contract`** (9 nodes): `StoragePort`, `.clearHistory()`, `.getConversationHistory()`, `.getMetrics()`, `.getPersonality()`, `.incrementMetric()`, `.saveMessage()`, `.setPersonality()`, `StoragePort.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ConversationHistory`** (9 nodes): `ConversationHistory`, `.add()`, `._cleanup()`, `.clear()`, `.constructor()`, `.destroy()`, `.getText()`, `.size()`, `ConversationHistory.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AudioTranscriber Service`** (9 nodes): `AudioTranscriber`, `.constructor()`, `._extractText()`, `._mimeToExt()`, `._normalizeMimeType()`, `.transcribe()`, `._transcribeGemini()`, `._transcribeWhisper()`, `AudioTranscriber.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DI Container`** (8 nodes): `Container`, `.clearSingletons()`, `.get()`, `.has()`, `.register()`, `.registeredTokens()`, `.resolve()`, `Container.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Plugin Manager`** (8 nodes): `PluginManager`, `.dispatch()`, `.getPluginForCommand()`, `.register()`, `.size()`, `.startAll()`, `.stopAll()`, `PluginManager.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tavily Search Adapter`** (8 nodes): `TavilyAdapter`, `.constructor()`, `._formatResults()`, `._isQuotaError()`, `.resetQuota()`, `.search()`, `._searchTavily()`, `TavilyAdapter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `OpenAI Adapter`** (8 nodes): `OpenAIAdapter`, `.constructor()`, `.#convertTools()`, `.generateContent()`, `.getStats()`, `.#normalizeSchema()`, `.processMedia()`, `OpenAIAdapter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Service`** (8 nodes): `DatabaseService`, `.getHistory()`, `.getMetrics()`, `.getPersonality()`, `.incrementMetric()`, `.saveSnapshot()`, `.setPersonality()`, `Database.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Downloader`** (8 nodes): `VideoDownloader`, `.detectVideoUrl()`, `.download()`, `.downloadAudio()`, `._downloadBinary()`, `._fetchTitle()`, `.getBinaryPath()`, `VideoDownloader.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Resumo Plugin`** (7 nodes): `RESUMO_PROMPT()`, `ResumoPlugin`, `.constructor()`, `.onCommand()`, `.onMessage()`, `._parseLimit()`, `ResumoPlugin.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Converter`** (7 nodes): `VideoConverter`, `.createTempPath()`, `.remuxForMobile()`, `.toGif()`, `.toMp4()`, `.toSticker()`, `VideoConverter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `WebSearch Service`** (7 nodes): `WebSearchService`, `._formatTavilyResults()`, `._isQuotaError()`, `.search()`, `._searchTavily()`, `._searchWithGrounding()`, `WebSearchService.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Personality Manager`** (6 nodes): `PersonalityManager`, `.getActiveName()`, `.getList()`, `.getPersonaConfig()`, `.setPersonality()`, `PersonalityManager.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FileSystem Utilities`** (6 nodes): `FileSystem.js`, `FileSystem`, `.cleanupDir()`, `.cleanupFiles()`, `.ensureDir()`, `.removeDir()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Logger`** (6 nodes): `Logger.js`, `Logger`, `.debug()`, `.error()`, `.info()`, `.warn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Gemini Transcriber Adapter`** (6 nodes): `GeminiTranscriberAdapter.js`, `GeminiTranscriberAdapter`, `.constructor()`, `._extractText()`, `._normalizeMimeType()`, `.transcribe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Image Processor`** (6 nodes): `ImageProcessor`, `.extractFrame()`, `.getMetadata()`, `.toPng()`, `.toSticker()`, `ImageProcessor.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Bot Entry Point`** (4 nodes): `index.js`, `BotInitializer`, `.start()`, `initializeBot()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `JidQueue Class`** (4 nodes): `JidQueue`, `.activeQueues()`, `.enqueue()`, `JidQueue.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AIPort Contract`** (4 nodes): `AIPort`, `.generateContent()`, `.getStats()`, `AIPort.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GroupService`** (4 nodes): `GroupService`, `.isAdmin()`, `.mentionAll()`, `GroupService.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SpontaneousPlugin`** (4 nodes): `SpontaneousPlugin`, `.constructor()`, `.onMessage()`, `SpontaneousPlugin.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Google Grounding Adapter`** (4 nodes): `GoogleGroundingAdapter`, `.constructor()`, `.search()`, `GoogleGroundingAdapter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ResumoPlugin Test Helpers`** (4 nodes): `makeBot()`, `makeLumaHandler()`, `seedMessages()`, `ResumoPlugin.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PluginManager Test Helpers`** (4 nodes): `BazPlugin`, `FooPlugin`, `makeBot()`, `PluginManager.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Group Manager`** (3 nodes): `GroupManager`, `.mentionEveryone()`, `GroupManager.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SearchPort Contract`** (3 nodes): `SearchPort`, `.search()`, `SearchPort.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TranscriberPort Contract`** (3 nodes): `TranscriberPort`, `.transcribe()`, `TranscriberPort.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CommandRouter Detect`** (3 nodes): `CommandRouter`, `.detect()`, `CommandRouter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GroupTools Plugin`** (3 nodes): `GroupToolsPlugin`, `.onCommand()`, `GroupToolsPlugin.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utils Plugin`** (3 nodes): `UtilsPlugin.js`, `UtilsPlugin`, `.onCommand()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exif Utility`** (3 nodes): `Exif.js`, `Exif`, `.writeExif()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ports Contract Tests`** (3 nodes): `MeuAdapter`, `MinhaIA`, `ports.contract.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GroupService Test Helpers`** (3 nodes): `makeBot()`, `makeParticipants()`, `GroupService.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Bot Initializer`** (2 nodes): `BotInitializer`, `initializeBot`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaileysAdapter Reply Methods`** (2 nodes): `BaileysAdapter.reply`, `BaileysAdapter.sendText`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tavily Search Logic`** (2 nodes): `TavilyAdapter.search`, `TavilyAdapter._searchTavily`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Socket and Reconnection`** (2 nodes): `createBaileysSocket`, `ReconnectionPolicy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FileSystem Dir Operations`** (2 nodes): `FileSystem.ensureDir`, `FileSystem.removeDir`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FileSystem Cleanup`** (2 nodes): `FileSystem.cleanupDir`, `FileSystem.cleanupFiles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `VideoDownloader Tests`** (2 nodes): `VideoDownloader Unit Tests`, `VideoDownloader`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MessageUtils Tests`** (2 nodes): `MessageUtils Test - getMessageType, extractUrl`, `MessageUtils - getMessageType, extractUrl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaileysSocketFactory Tests`** (2 nodes): `BaileysSocketFactory`, `BaileysSocketFactory Test`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Stop Bot`** (1 nodes): `stopBot`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Changelog`** (1 nodes): `Changelog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Audio Download Changelog`** (1 nodes): `v6.2.0 Audio Download Plugin`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaileysAdapter React`** (1 nodes): `BaileysAdapter.react`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaileysAdapter Reply Check`** (1 nodes): `BaileysAdapter.isRepliedToMe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GeminiAdapter Search Port`** (1 nodes): `GeminiAdapter.setSearchPort`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `OpenAI Media Processing`** (1 nodes): `OpenAIAdapter.processMedia`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GoogleGrounding Search`** (1 nodes): `GoogleGroundingAdapter.search`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SQLite History Query`** (1 nodes): `SQLiteStorageAdapter.getConversationHistory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SQLite Message Save`** (1 nodes): `SQLiteStorageAdapter.saveMessage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `InMemory Clear`** (1 nodes): `InMemoryStorageAdapter.clear`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Env Key Warning`** (1 nodes): `warnIfNoAIKey`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Menu Constants`** (1 nodes): `MENUS constants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Message Constants`** (1 nodes): `MESSAGES constants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Baileys Session Prep`** (1 nodes): `prepareBaileysSession`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exif Class`** (1 nodes): `Exif`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exif Write Method`** (1 nodes): `Exif.writeExif`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FileSystem Class`** (1 nodes): `FileSystem`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Logger Debug`** (1 nodes): `Logger.debug`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AI Core Documentation` connect `AI Core Concepts` to `Architecture Documentation`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `GeminiAdapter` connect `AI Provider Core` to `AI Core Concepts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `env config object` connect `AI Provider Core` to `Bootstrap and DI Wiring`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `MinhaIA`, `MeuAdapter`, `FooPlugin` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Provider Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Architecture Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `BaileysAdapter Methods` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._