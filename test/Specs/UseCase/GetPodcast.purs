module Test.Specs.UseCase.GetPodcast where

import Prelude

import Data.Array (length)
import Data.List.Lazy (nil, replicate)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype, unwrap)
import Effect.Aff (Aff)
import Entity.Podcast (Item, Podcast)
import Port.PodcastM (class PodcastM)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)
import UseCase.GetPodcast as GetPodcast

mockItem :: Item
mockItem =
  { id: "1"
  , title: "Test Episode"
  , description: "Test Description"
  , link: "http://test.com/1"
  , pubDate: "2024-02-19"
  , enclosure: { url: "http://test.com/1.mp3", type: "audio/mpeg" }
  , duration: "00:30:00"
  , image: "http://test.com/1.jpg"
  }

mockPodcast :: Podcast
mockPodcast =
  { title: "Test Podcast"
  , author: "Test Author"
  , description: "Test Description"
  , link: "http://test.com"
  , image: "http://test.com/cover.jpg"
  , lastBuild: "2024-02-19"
  , items: []
  }

newtype TestM a = TestM (Aff a)

derive instance newtypeTestM :: Newtype (TestM a) _

derive newtype instance Functor TestM
derive newtype instance Apply TestM
derive newtype instance Applicative TestM
derive newtype instance Bind TestM
derive newtype instance Monad TestM

instance testPodcastM :: PodcastM TestM where
  loadPodcast "test-id" = pure (Just mockPodcast)
  loadPodcast _ = pure Nothing
  savePodcast _ _ = pure unit
  createPodcast _ _ = pure mockPodcast
  getItemList _ Nothing = pure $ replicate 20 mockItem
  getItemList _ (Just _) = pure nil

runTestM :: TestM ~> Aff
runTestM = unwrap

spec :: Spec Unit
spec = describe "GetPodcast Test" do
  it "should return when cache hits" do
    result <- runTestM (GetPodcast.execute "test-id" 1 (Just "keyword"))
    result `shouldEqual` mockPodcast

  it "should return when cache miss" do
    result <- runTestM (GetPodcast.execute "another-test-id" 1 (Just "keyword"))
    result `shouldEqual` mockPodcast

  it "should respect the limit parameter" do
    result <- runTestM (GetPodcast.execute "test-id" 1 Nothing)
    length result.items `shouldEqual` 1

  it "should handle keyword search" do
    result <- runTestM (GetPodcast.execute "test-id" 1 (Just "keyword"))
    length result.items `shouldEqual` 0

  it "should return correct item structure" do
    result <- runTestM (GetPodcast.execute "test-id" 1 Nothing)
    case result.items of
      [ item ] -> item `shouldEqual` mockItem
      _ -> pure unit