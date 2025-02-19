module UseCase.GetPodcast
  ( execute
  ) where

import Prelude

import Data.List.Lazy (take, toUnfoldable)
import Data.Maybe (Maybe(..))
import Entity.Podcast (Podcast)
import Port.PodcastM (class PodcastM, createPodcast, getItemList, loadPodcast, savePodcast)

execute :: forall m. PodcastM m => String -> Int -> Maybe String -> m Podcast
execute id limit keyword = do
  let key = toKey id limit keyword
  cached <- loadPodcast key
  _podcast <- case cached of
    Just value -> pure value
    Nothing -> createPodcast id keyword
  itemList <- getItemList id keyword
  let podcast = _podcast { items = toUnfoldable $ take limit itemList }
  savePodcast key podcast
  pure podcast

toKey :: String -> Int -> Maybe String -> String
toKey id limit Nothing = id <> "_" <> (show limit)
toKey id limit (Just keyword) = id <> "_" <> keyword <> "_" <> (show limit)
