module Port.PodcastM where

import Prelude

import Data.List.Lazy (List)
import Data.Maybe (Maybe)
import Entity.Podcast (Podcast, Item)

class Monad m <= PodcastM m where
  loadPodcast :: String -> m (Maybe Podcast)
  savePodcast :: String -> Podcast -> m Unit
  createPodcast :: String -> Maybe String -> m Podcast
  getItemList :: String -> Maybe String -> m (List Item)