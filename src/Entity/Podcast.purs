module Entity.Podcast where

type Podcast =
  { title :: String
  , author :: String
  , description :: String
  , link :: String
  , image :: String
  , lastBuild :: String
  , items :: Array Item
  }

type Item =
  { id :: String
  , title :: String
  , description :: String
  , link :: String
  , pubDate :: String
  , enclosure :: { url :: String, type :: String }
  , duration :: String
  , image :: String
  }