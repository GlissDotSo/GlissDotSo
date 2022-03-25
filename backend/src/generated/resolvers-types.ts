import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AttentionMarketMakerBidData = {
  __typename?: 'AttentionMarketMakerBidData';
  amount: Scalars['Int'];
  expiry: Scalars['Int'];
  feedId: Scalars['Int'];
  from: Scalars['String'];
  pubId: Scalars['Int'];
};

export type AttentionMarketMakerMutation = {
  __typename?: 'AttentionMarketMakerMutation';
  bidAndUpdate?: Maybe<Scalars['Boolean']>;
  fillAndUpdate?: Maybe<Scalars['Boolean']>;
};


export type AttentionMarketMakerMutationBidAndUpdateArgs = {
  bid?: InputMaybe<AttentionMarketMakerBidData>;
  feedOracleMsg: Scalars['String'];
};


export type AttentionMarketMakerMutationFillAndUpdateArgs = {
  feedId: Scalars['Int'];
  feedOracleMsg: Scalars['String'];
  roundId: Scalars['Int'];
};

export type AttentionMarketMakerQuery = {
  __typename?: 'AttentionMarketMakerQuery';
  getCurrentRoundInfo?: Maybe<CurrentRoundInfo>;
  isRoundOpen: Scalars['Boolean'];
};


export type AttentionMarketMakerQueryGetCurrentRoundInfoArgs = {
  feedOracleMsg: Scalars['String'];
};


export type AttentionMarketMakerQueryIsRoundOpenArgs = {
  roundId: Scalars['Int'];
};

export type AuthenticationRequest = {
  message: DispatcherAuthMessage;
  signature: Scalars['String'];
};

export type CurrentRoundInfo = {
  __typename?: 'CurrentRoundInfo';
  numSlots: Scalars['Int'];
  roundId: Scalars['Int'];
};

export type DispatcherAuthMessage = {
  mainWallet: Scalars['String'];
  sessionWalletPubkey: Scalars['String'];
};

export type Feed = {
  __typename?: 'Feed';
  email: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  attentionMarketMaker?: Maybe<AttentionMarketMakerMutation>;
  authenticate?: Maybe<Scalars['Boolean']>;
};


export type MutationAuthenticateArgs = {
  request: AuthenticationRequest;
};

export type Query = {
  __typename?: 'Query';
  attentionMarketMaker?: Maybe<AttentionMarketMakerQuery>;
  feed: Feed;
};


export type QueryFeedArgs = {
  id: Scalars['ID'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AttentionMarketMakerBidData: ResolverTypeWrapper<AttentionMarketMakerBidData>;
  AttentionMarketMakerMutation: ResolverTypeWrapper<AttentionMarketMakerMutation>;
  AttentionMarketMakerQuery: ResolverTypeWrapper<AttentionMarketMakerQuery>;
  AuthenticationRequest: AuthenticationRequest;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CurrentRoundInfo: ResolverTypeWrapper<CurrentRoundInfo>;
  DispatcherAuthMessage: DispatcherAuthMessage;
  Feed: ResolverTypeWrapper<Feed>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AttentionMarketMakerBidData: AttentionMarketMakerBidData;
  AttentionMarketMakerMutation: AttentionMarketMakerMutation;
  AttentionMarketMakerQuery: AttentionMarketMakerQuery;
  AuthenticationRequest: AuthenticationRequest;
  Boolean: Scalars['Boolean'];
  CurrentRoundInfo: CurrentRoundInfo;
  DispatcherAuthMessage: DispatcherAuthMessage;
  Feed: Feed;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  Query: {};
  String: Scalars['String'];
}>;

export type AttentionMarketMakerBidDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttentionMarketMakerBidData'] = ResolversParentTypes['AttentionMarketMakerBidData']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expiry?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  feedId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pubId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttentionMarketMakerMutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttentionMarketMakerMutation'] = ResolversParentTypes['AttentionMarketMakerMutation']> = ResolversObject<{
  bidAndUpdate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<AttentionMarketMakerMutationBidAndUpdateArgs, 'feedOracleMsg'>>;
  fillAndUpdate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<AttentionMarketMakerMutationFillAndUpdateArgs, 'feedId' | 'feedOracleMsg' | 'roundId'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttentionMarketMakerQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttentionMarketMakerQuery'] = ResolversParentTypes['AttentionMarketMakerQuery']> = ResolversObject<{
  getCurrentRoundInfo?: Resolver<Maybe<ResolversTypes['CurrentRoundInfo']>, ParentType, ContextType, RequireFields<AttentionMarketMakerQueryGetCurrentRoundInfoArgs, 'feedOracleMsg'>>;
  isRoundOpen?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<AttentionMarketMakerQueryIsRoundOpenArgs, 'roundId'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CurrentRoundInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['CurrentRoundInfo'] = ResolversParentTypes['CurrentRoundInfo']> = ResolversObject<{
  numSlots?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roundId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FeedResolvers<ContextType = any, ParentType extends ResolversParentTypes['Feed'] = ResolversParentTypes['Feed']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  attentionMarketMaker?: Resolver<Maybe<ResolversTypes['AttentionMarketMakerMutation']>, ParentType, ContextType>;
  authenticate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAuthenticateArgs, 'request'>>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  attentionMarketMaker?: Resolver<Maybe<ResolversTypes['AttentionMarketMakerQuery']>, ParentType, ContextType>;
  feed?: Resolver<ResolversTypes['Feed'], ParentType, ContextType, RequireFields<QueryFeedArgs, 'id'>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  AttentionMarketMakerBidData?: AttentionMarketMakerBidDataResolvers<ContextType>;
  AttentionMarketMakerMutation?: AttentionMarketMakerMutationResolvers<ContextType>;
  AttentionMarketMakerQuery?: AttentionMarketMakerQueryResolvers<ContextType>;
  CurrentRoundInfo?: CurrentRoundInfoResolvers<ContextType>;
  Feed?: FeedResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

