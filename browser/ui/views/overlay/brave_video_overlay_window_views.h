
#ifndef BRAVE_BROWSER_UI_VIEWS_OVERLAY_BRAVE_VIDEO_OVERLAY_WINDOW_VIEWS_H_
#define BRAVE_BROWSER_UI_VIEWS_OVERLAY_BRAVE_VIDEO_OVERLAY_WINDOW_VIEWS_H_

#include "chrome/browser/ui/views/overlay/video_overlay_window_views.h"

class BraveVideoOverlayWindowViews: public VideoOverlayWindowViews {
 public:
  using VideoOverlayWindowViews::VideoOverlayWindowViews;

  BraveVideoOverlayWindowViews(const BraveVideoOverlayWindowViews&) = delete;
  BraveVideoOverlayWindowViews& operator=(const BraveVideoOverlayWindowViews&) = delete;

  ~BraveVideoOverlayWindowViews() override;

  void SetUpViews() override;
};


#endif  // BRAVE_BROWSER_UI_VIEWS_OVERLAY_BRAVE_VIDEO_OVERLAY_WINDOW_VIEWS_H_
