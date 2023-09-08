// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

#include "brave/browser/ui/webui/ai_chat/ai_chat_ui_page_handler_impl.h"

#include <utility>

#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "content/public/browser/web_contents.h"

namespace ai_chat {

AIChatUIPageHandlerImpl::AIChatUIPageHandlerImpl(
    content::WebContents* owner_web_contents,
    TabStripModel* tab_strip_model,
    Profile* profile,
    mojo::PendingReceiver<ai_chat::mojom::PageHandler> receiver)
    : AIChatUIPageHandler(owner_web_contents, profile, std::move(receiver)) {
  DCHECK(tab_strip_model);

  bool is_standalone = (tab_strip_model->GetIndexOfWebContents(
                            owner_web_contents) != TabStripModel::kNoTab);

  if (!is_standalone) {
    tab_strip_model->AddObserver(this);
  }
  InitAIChatUIPageHandler(is_standalone,
                          tab_strip_model->GetActiveWebContents());
}

AIChatUIPageHandlerImpl::~AIChatUIPageHandlerImpl() = default;

void AIChatUIPageHandlerImpl::OnTabStripModelChanged(
    TabStripModel* tab_strip_model,
    const TabStripModelChange& change,
    const TabStripSelectionChange& selection) {
  if (selection.active_tab_changed()) {
    if (active_chat_tab_helper_) {
      active_chat_tab_helper_ = nullptr;
      chat_tab_helper_observation_.Reset();
    }

    if (selection.new_contents) {
      active_chat_tab_helper_ =
          AIChatTabHelper::FromWebContents(selection.new_contents);
      // Let the tab helper know if the UI is visible
      active_chat_tab_helper_->OnConversationActiveChanged(
          (web_contents()->GetVisibility() == content::Visibility::VISIBLE)
              ? true
              : false);
      chat_tab_helper_observation_.Observe(active_chat_tab_helper_);
    }
    // Reset state
    page_->OnTargetTabChanged();
  }
}

}  // namespace ai_chat
