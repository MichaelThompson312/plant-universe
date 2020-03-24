import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
	mutation removeFromCart($id: ID!) {
		removeFromCart(id: $id) {
			id
		}
	}
`;

const BigButton = styled.button`
	font-size: 3rem;
	background: none;
	border: 0;
	&:hover {
		color: ${(props) => props.theme.red};
		cursor: pointer;
	}
`;

export default class RemoveFromCart extends Component {
	static propTypes = {
		id: PropTypes.string.isRequired
	};
	update = (cache, payload) => {
		console.log('runnning remove from cart funcation');
		//First read the cache
		const data = cache.readQuery({ query: CURRENT_USER_QUERY });
		console.log(data);
		const cartItemId = payload.data.removeFromCart.id;
		data.me.cart = data.me.cart.filter((cartItem) => cartItem.id === cartItemId);
		cache.writeQuery({ query: CURRENT_USER_QUERY, data });
		//remove that item from the cart
		//write it back to the cache
	};
	render() {
		return (
			<Mutation
				mutation={REMOVE_FROM_CART_MUTATION}
				variables={{ id: this.props.id }}
				update={this.update}
				optimisticResponse={{
					__typeName: 'Mutation',
					removeFromCart: {
						__typeName: 'CartItem',
						id: this.props.id
					}
				}}
			>
				{(removeFromCart, { loading, error }) => (
					<BigButton
						disabled={loading}
						onClick={() => {
							removeFromCart().catch((err) => alert(err.message));
						}}
						title="Delete Item"
					>
						&times;
					</BigButton>
				)}
			</Mutation>
		);
	}
}
