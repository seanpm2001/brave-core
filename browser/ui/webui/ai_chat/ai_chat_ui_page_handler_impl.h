// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

#ifndef BRAVE_BROWSER_UI_WEBUI_AI_CHAT_AI_CHAT_UI_PAGE_HANDLER_IMPL_H_
#define BRAVE_BROWSER_UI_WEBUI_AI_CHAT_AI_CHAT_UI_PAGE_HANDLER_IMPL_H_

#include "brave/browser/ui/webui/ai_chat/ai_chat_ui_page_handler.h"

#include "brave/components/ai_chat/common/mojom/ai_chat.mojom.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"

namespace content {
class WebContents;
}

class Profile;
class TabStripModel;

namespace ai_chat {
class AIChatUIPageHandlerImpl : public AIChatUIPageHandler,
                                public TabStripModelObserver {
 public:
  AIChatUIPageHandlerImpl(
      content::WebContents* owner_web_contents,
      TabStripModel* tab_strip_model,
      Profile* profile,
      mojo::PendingReceiver<ai_chat::mojom::PageHandler> receiver);

  AIChatUIPageHandlerImpl(const AIChatUIPageHandlerImpl&) = delete;
  AIChatUIPageHandlerImpl& operator=(const AIChatUIPageHandlerImpl&) = delete;

  ~AIChatUIPageHandlerImpl() override;

 private:
  // TabStripModelObserver
  void OnTabStripModelChanged(
      TabStripModel* tab_strip_model,
      const TabStripModelChange& change,
      const TabStripSelectionChange& selection) override;
};

}  // namespace ai_chat

#endif  // BRAVE_BROWSER_UI_WEBUI_AI_CHAT_AI_CHAT_UI_PAGE_HANDLER_IMPL_H_
