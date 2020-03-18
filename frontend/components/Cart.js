import React from 'react';
import { wuery, Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButtom from './styles/CloseButton';
import SickButton from './styles/SickButton';

const LOCAL_STATE_QUERY = gql`
	query {
		cartOpen @client
	}
`;

const TOGGLE_CART_MUTATION = gql`
	mutation {
		toggleCart @client
	}
`;

const Cart = () => (
	<Mutation mutation={TOGGLE_CART_MUTATION}>
		{(toggleCart) => (
			<Query query={LOCAL_STATE_QUERY}>
				{({ data }) => (
					<CartStyles open={data.cartOpen}>
						<header>
							<CloseButtom onClick={toggleCart} title="Close">
								&times;
							</CloseButtom>
							<Supreme>Your Cart</Supreme>
							<p>You have __ Items in your cart</p>
						</header>
						<footer>
							<p>$10</p>
							<SickButton>Checkout</SickButton>
						</footer>
					</CartStyles>
				)}
			</Query>
		)}
	</Mutation>
);
export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
