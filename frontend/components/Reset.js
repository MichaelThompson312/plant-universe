import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
	mutation REQUEST_RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
		resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
			id
			email
			name
		}
	}
`;

class Reset extends Component {
	static propTypes = {
		resetToken: propTypes.string.isRequired
	};
	state = {
		password: '',
		confirmPassword: ''
	};
	saveToState = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	render() {
		return (
			<Mutation
				mutation={RESET_MUTATION}
				variables={{
					resetToken: this.state.resetToken,
					password: this.state.password,
					confirmPassword: this.state.confirmPassword
				}}
				refetchQueries={[
					{
						query: CURRENT_USER_QUERY
					}
				]}
			>
				{(reset, { error, loading, called }) => (
					<Form
						method="post"
						onSubmit={async (e) => {
							e.preventDefault();
							await reset();
							this.setState({ password: '', confirmPassword: '' });
						}}
					>
						<fieldset disabled={loading} aria-busy={loading}>
							<h2>Reset your password</h2>
							<Error error={error} />
							<label htmlFor="password">
								Password
								<input
									type="password"
									name="password"
									value={this.state.password}
									onChange={this.saveToState}
								/>
							</label>
							<h2>Confirm your password</h2>
							<Error error={error} />
							<label htmlFor="confirmPassword">
								Password
								<input
									type="password"
									name="confirmPassword"
									value={this.state.confirmPassword}
									onChange={this.saveToState}
								/>
							</label>
							<button type="submit">Reset</button>
						</fieldset>
					</Form>
				)}
			</Mutation>
		);
	}
}

export default Reset;
