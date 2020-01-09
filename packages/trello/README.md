<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# Using the Trello package

The `/whisk.system/trello` package offers a convenient way to use the [Trello REST API](https://developers.trello.com/reference#tokenstoken-1).

The package includes the following feed:

| Entity | Type | Parameters | Description |
| --- | --- | --- | --- |
| `/whisk.system/trello` | package | username, repository, accessToken | Interact with the Trello API |
| `/whisk.system/trello/webhook` | feed | events, username, repository, accessToken | Fire trigger events on Trello activity |

Creating a package binding with the `APIKey`, `idModel`, `accessToken` and `description` values is suggested.  With binding, you don't need to specify the values each time that you use the feed in the package.

## Firing a trigger event with GitHub activity

The `/whisk.system/trello/webhook` feed configures a service to fire a trigger when there is activity in a specified GitHub repository. The parameters are as follows:

- `APIKey`: The  developer API key see [Trello API key security](https://developers.trello.com/docs/api-key-security).
- `idModel`: id of card, list or board of interest [How to get the id of your model of interest](https://stackoverflow.com/questions/26552278/trello-api-getting-boards-lists-cards-information)
- `accessToken`: Your Trello personal server token. 
- `description`: description of your webhook

The following is an example of creating a trigger that will be fired each time that there is a new commit to a GitHub repository.



1. Create a package binding that is configured for your Trello object model (for example card, list, board model). See [Trello authorization](https://developers.trello.com/page/authorization) how to get the server token an  API key

  ```
  wsk package bind /whisk.system/trello myTrello \
    --param APIKey 12gh457hg887hg45 \
    --param idModel 1d221fg4551 \
    --param accessToken 48gjj874gdf545s12 \
    --param description mydescription 
  ```

2. Create a trigger by using your `myTrello/webhook` feed.

  ```
  wsk trigger create myTrelloTrigger --feed myTrello/webhook 
  ```

  A change  to the prefered Trello model  causes the trigger to be fired by the webhook. If there is a rule that matches the trigger, then the associated action will be invoked.

  The action receives the Trello webhook payload as an input parameter.

  For more information about the payload content, see  [Trello webhooks](https://developers.trello.com/page/webhooks).
