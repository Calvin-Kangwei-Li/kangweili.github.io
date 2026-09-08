---
title: Numerical Implementation of Policy Optimization for Inventory Management
date: 2026-08-29
tags: [research]
---

# Numerical Implementation of Policy Optimization for Inventory Management

In my research, the proposed Wasserstein trust-region method achieves nice convergence result with precise critic and actor updates. However, in practice, we are not able to implement the precise critic and actor like mathematics. Considering the powerful approximation by neural networks, we now usually apply deep reinforcement learning methods to solve the real MDP problems. In this note, I want to record the progress of learning the whole struture of setting up a RL model for real inventory management problem, implementing existing policy optimization methods and visualize the results.

## References

[OpenAI](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html), [Gijsbrechts et al.](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3302881) and [their code base](https://github.com/JorenGijsbrechts/DRL_A3C_inventory), [Boute](https://www.sciencedirect.com/science/article/pii/S0377221721006111?utm_source=chatgpt.com), [or-gym](https://github.com/hubbs5/or-gym).

## MDP and CMDP models of inventory problem

### Lost sales inventory replenishment

First we consider a simple inventory problem. We consider inventory of one type of commodity with lead time $l$. The unsatisfied demand are lost rather than backlogged with no extra cost.

- Let $x_t$ be total inventory at period $t$, $y_t$ be inventory order that will arrive at period $t+1$. **State** variable $S_t = (x_t, y_t)\in [0,B]\times [0, A_{max}]$, where $B$ is maximum inventory capacity and $A_{max}$ is the maximum of order.
- **Action** variable $A_t \in [0,A_{max}]$ is the order we make at period $t$.
- The demand at period is $D_t\sim PP(\lambda)$ and this along with order decision creates the **transition kernel** $P(\cdot|S_t, A_t)$.
- We only balance the tradeoff between holding inventory and lost sales. Let $H_t = (x_t-D_t)^+$ and $L_t = (D_t-x_t)^+$. Considering the order cost, we model the cost function to be
\[c(S_t, A_t, D_t) = c_0 A_t+h H_t+ bL_t.\]
In RL literature, we use **reward function** $r(S_t, A_t, D_t) = -c(S_t, A_t, D_t).$

Here we use initial state $S_0 = (0,0)$ and a discount factor $\gamma = 0.95$. The other parameters are set
\[
    l=2,\;B=30,\; A_{max} = 20,\; \lambda = 5,\; c_0 = 0.5,\; h = 1,\; b=4.\]

**Remark.** Curse of dimensionality manifest in this model on three aspects; this shows why dynamic programming does not work even in such easy model but with large scale.

- Lead time causes a large state in lost sales problem. In backlogging problem, the large state position can be summarized to one-dimensional base-stock structure. When types of commodity rises, the dimension of state space increases exponentially.
- Action dimension curse.
- Transition kernel curse.

### Adding service constraint

In this part, we apply a service constraint on the previous model as [Morris](https://www.jstor.org/stable/2631937) did, and derive the constrained MDP model for this constrained inventory problem. Roughly speaking, service constraint considers the service quality of the inventory manager. This quality is measured by the ratio of the unsatisfied demands to the overall demand.

Recall that the lost sales in period $t$ are $
L_t := (D_t-x_t)^+.$
For a policy $\pi$, the expected fill rate (which is adapted to our discount framework) over the finite horizon $H$ is defined as
\[
\beta(\pi)
:=
1-
\frac{
\mathbb{E}_{\pi}\!\left[\sum_{t=0}^{H-1}\gamma^tL_t\right]
}{
\mathbb{E}\!\left[\sum_{t=0}^{H-1}\gamma^tD_t\right]
}.
\]
Given a prescribed minimum service level $\beta_0\in(0,1)$, the service
constraint is $\beta(\pi)\geq \beta_0$, i.e.
\[
\mathbb{E}_{\pi}\!\left[
\sum_{t=0}^{H-1}\gamma^t L_t
\right]
\leq
(1-\beta_0)
\mathbb{E}\!\left[
\sum_{t=0}^{H-1}\gamma^tD_t
\right].
\]
Since the demands are i.i.d. with $\mathbb{E}[D_t]=\lambda$ and we choose the service level $\beta_0 = 0.95$, plugging in the model parameters gives us the discounted lost-sales budget $
C_{\mathrm{service}}
\approx 4.9704.$

Adding this constraint to our previous objective gives us a constrained MDP model, on which we can apply our PD-LSQR method.

### Architecture of Neural Policy

We record the architecture of the neural policy used in our two toy instances as follows.

The neural policy is a $6-64-64-1$ MLP with a $4$-dimensional latent Gaussian variable. The input is the scaled state $\tilde s_t = (\frac{x_t}{30}, \frac{y_t}{20})$ along with a latent variable $z_t\sim N(0, I_4)$. The activation function for the two hidden layers is tanh function, and the final out put is scaled to 20 with sigmoid function, i.e.
\[
A_\theta(s,z)=A_{\max}\sigma\left(
W_3\tanh\left(W_2\tanh\left(W_1[\widetilde s;z]+b_1\right)+b_2\right)+b_3
\right).
\]

## Numerical implementation of Wasserstein method

In this part we present the LSQR method for implementing the Wasserstein trust region algorithm in a RL setting.

### Overview of the LSQR method for WTR

#### Wasserstein Gradient Information

On a high perspective, we consider the differentiation of the loss function with regard to the parameter space.
For a small parameter perturbation $u$,

$$
\widehat{L}_t(\theta_t+\varepsilon u)
=
\widehat{L}_t(\theta_t)
+
\varepsilon D\widehat{L}_t(\theta_t)[u]
+
o(\varepsilon).
$$

This differentiation is actually a linear functional on the parameter vector space. On this vector space we can of course define various inner products. By Riesz representation theorem, this functional can be represented by a vector in the parameter space, so that the value of functional on any vector is exactly the inner product of the vector with the representative vector of the functional. The different choice of the geometry of underlying parameter space gives us diverse representative function.

If we use Euclidean geometry, we can get the usual parameter gradient through chain rule,

$$
\begin{aligned}
D\widehat{L}_t(\theta_t)[u]
=
g_t^\top u,\quad g_t
=
\mathbb E_{s,z}
\left[
J_t(s,z)^\top b_t(s,z)
\right], \\
\quad J_t(s,z) := D_\theta A_{\theta_t}(s,z),\;
b_t(s,z)
=
\left.
\nabla_a \widehat{L}_t
\right|_{a=A_{\theta_t}(s,z)},
\end{aligned}
$$

and $g_t$ is the representative for differentiation functional under Euclidean geometry.

Instead we wish to realize Wasserstein trust region in policy space through the parameter update. Through the coupling bound

$$
W_2^2(\pi_{\theta^\prime}(\cdot|s),\pi_{\theta}(\cdot|s))
\le
\mathbb E_{Z}[A_{\theta^\prime}(s,Z) - A_{\theta}(s,Z)],
$$

and the first order action displacement

$$
A_{\theta_t+u}(s,z)-A_{\theta_t}(s,z)
\approx J_t(s,z)u,
$$

we derive the local pullback geometry of parameter space from Wasserstein geometry

$$
\begin{aligned}
&\mathcal{W}_t^2(\theta_t+u,\theta_t)
\approx
\mathbb E_{s,z}
\left[
    \left\|J_t(s,z)u\right\|_2^2
\right]
=
u^\top M_tu,\\
&M_t
=
\mathbb E_{s,z}
\left[
    J_t(s,z)^\top J_t(s,z)
\right].
\end{aligned}
$$

This geometry gives a different parameter gradient (the representative of the same functional under Wasserstein pullback geometry)

$$
D\widehat L_t(\theta_t)[u]
=
\langle h_t, u\rangle_{W,t}
=
h_t^\top M_tu.
$$

Combining the result with previous Euclidean representative, we derive the pullback system. Here we also use damping to stabilize the system

$$
(M_t + \mu_tI)h_t = g_t,\quad \mu_t>0.
$$

#### From Sampling to Matrix-Free LSQR

Here we consider the numerical details of the empirical pullback system and LSQR, including the on-policy sampling, first and second order information sample size and matrix-free LSQR implementation.

We roll out $N_{traj}$ trajectories and let $n$ denote the trajectory index. Let $H$ be the horizon of each trajectory and $0\le k< H$ denote the model periods within a trajectory. We use current policy parameter $\theta_t$ to generate action (we dispose of the iteration index for state and latent variable for short, but here they are all determined by the itertion step $t$)

$$
a_{t,n,k} = A_{\theta_t}(s_{n,k},z_{n,k}), \quad z_{n,k} \sim \nu,
$$

and the state evolves according to realization of environmental noise $s_{n,k+1} = F(s_{n,k}, a_{n,k}, \xi_{n,k})$. In this way we get the rollout pool with $N_{traj}H$ state-latent-variable-action points

$$
\mathcal{D}_t
=
\left\{
(s_{n,k}, z_{n,k}, a_{n,k}, \xi_{n,k})
:\;
1 \le n \le N_{traj},\;
0 \le k < H
\right\}.
$$

With this pool, we can construct the empirical Lagrangian function for CMDP model,

$$
\widehat C_t
=
\frac 1 {N_{traj}}
\sum_{n = 1}^{N_{traj}}
\sum_{k = 0}^{H-1}
\gamma^kc_{t,n,k},
\quad
\widehat G_t
=
\frac 1 {N_{traj}}
\sum_{n = 1}^{N_{traj}}
\sum_{k = 0}^{H-1}
\gamma^kg_{t,n,k},
\quad
\widehat L_t
=
\widehat C_t - \lambda_t\widehat G_t.
$$

For MDP model we can just ignore the constraint part.

For actor update, we use a minibatch $\mathcal N_t\subset \{1,\dots,N_{traj}\}\times\{0,\dots, H-1\}$, $|\mathcal N_t| = N_t.$ The index $(n,k)$ in $\mathcal N_t$ is flatten to $i = (n,k)$ and let $x_{t,i} = (s_{n,k}, z_{n,k})$. The pathwise action derivative is $b_{t,i} = \nabla_{a_{t,i}}\widehat L_t$, and the action-parameter Jacobian is

$$
J_{t,i}
=
\nabla_{\theta}A_{\theta}(x_{t,i})
\big|_{\theta = \theta_t}.
$$

Then the chain rule gives us sampled parameter gradient

$$
\hat g_t
=
\frac{1}{N_td_a}
\sum_{i\in \mathcal N_t}
J_{t,i}^\top b_{t,i}.
$$

Choose a metric sample subset $\mathcal M_t\subset \mathcal N_t$ with $|\mathcal M_t| = m_t = \lceil fN_t\rceil,$ where $f$ is the metric subsample size. The empirical pullback matrix is

$$
\widehat M_t
=
\frac{1}{m_td_a}
\sum_{i\in \mathcal M_t}
J_{t,i}^\top J_{t,i}.
$$

As for the damping constant, we choose one damping size $\mu_0$ and adapt the damping to all action dimensions by $\mu_t = \frac{\mu_0}{d_a}.$ So far, we've built the empirical pullback system

$$
(\widehat M_t+\mu_tI)h_t = \hat g_t.
$$

To solve the above damped system without forming the large matrix $\widehat M_t$, define its augmented rectangular operator and respective right-hand side

$$
A_t u
=
\left[
\begin{array}{c}
\displaystyle
\left(J_{t,i} u\right)_{i\in\mathcal{M}_t}
\Big/ \sqrt{m_td_a}
\\[4pt]
\sqrt{\mu_t}\,u
\end{array}
\right],
\quad
r_t
=
\begin{bmatrix}
0\\
\widehat g_t/\sqrt{\mu_t}
\end{bmatrix}.
$$

Since

$$
A_t^\top A_t
=
\widehat M_t+\mu_t I,
\qquad
A_t^{\top}r_t
=
\widehat g_t,
$$

the normal equation of

$$
\min_{h\in\mathbb R^p}
\|A_t h-r_t\|_2^2
$$

is exactly the pullback system. LSQR can therefore approximate $h_t$ using only repeated calls to $A_t$ and $A_t^{\top}$, which reduce to JVPs, VJPs, and vector operations. Neither the stacked Jacobian nor the $p\times p$ pullback matrix is constructed, yielding a matrix-free implementation of the Wasserstein-gradient solve.

Writing the $k$th LSQR iterate as $h_t^{(k)}$, the iteration is terminated when the relative residual of the original damped pullback system satisfies

$$
\frac{
\|(\widehat M_t+\delta_t I)h_t^{(k)}-\widehat g_t\|_2
}{
\max\{\|\widehat g_t\|_2,\varepsilon_{\mathrm{num}}\}
}
\leq
\varepsilon_{\mathrm{LSQR}},
$$

or when the prescribed iteration budget $K_{\mathrm{LSQR}}$ is reached.

### LP Benchmarking for PD-LSQR

To benchmark PD--LSQR, we construct an exact finite-horizon reference after restricting the inventory state and order to the integer grid

\[
x\in\{0,\ldots,30\},\qquad
y\in\{0,\ldots,20\},\qquad
a\in\{0,\ldots,20\}.
\]

This gives $|S|=651$ states and $|A|=21$ actions.  For each $s=(x,y)$ and $a$, the transition kernel

$$
P(s'\mid s,a)
=
\sum_{d=0}^{\infty}\mathbb P(D=d)
\mathbf 1\left\{
x'=\min\{30,(x-d)^++y\},\ y'=a
\right\}
$$

are computed analytically. We similarly compute the discrete cost function
\[
\bar H(x)=\mathbb E[(x-D)^+],\;
\bar L(x)=\mathbb E[(D-x)^+],\;
\bar c(s,a)=c_0a+h\bar H(x)+b\bar L(x).
\]
For every period \(t\), state \(s\), and action \(a\), introduce the
state--action occupation measure
\[
z_{t,s,a}=\mathbb P(S_t=s,A_t=a).
\]
The constrained reference is the linear program
\[
\begin{aligned}
\min_{z\ge0}\quad
&\sum_{t=0}^{99}\gamma^t
  \sum_{s\in\mathcal S}\sum_{a\in\mathcal A}
  \bar c(s,a)z_{t,s,a},\\
\text{subject to}\quad
&\sum_a z_{0,s,a}=\rho_0(s),
&&s\in\mathcal S,\\
&\sum_a z_{t,s,a}
=\sum_{\bar s,\bar a}
P(s\mid\bar s,\bar a)z_{t-1,\bar s,\bar a},
&&t=1,\ldots,99,\ s\in\mathcal S,\\
&\sum_{t=2}^{99}\gamma^{t-2}
  \sum_{s,a}\bar L(s)z_{t,s,a}
\le C_{service},
\end{aligned}
\]
where \(\rho_0=\delta_{(0,0)}\), \(\gamma=0.95\), and $C_{service} = 4.9703$. We solve this LP and randomize the vector $z_{t,s,a}$ to give the benchmarking policy.

### Hyperparameters to tune in this algorithm

Suppose we are given the RL environment setup $(S, A\subset R^{d_a}, P, r, \gamma)$.

**Neural actor and critic layer.**

- Actor architecture: layer number, hidden width, activation function, latent variable dimension

**Rollout layer.**

- $N_{traj}$ of trajectories with horizon $H$ (this part is called **rollout**, beginning of each optimizing step $t$; the policy used for rollout is current policy $\pi_{\theta_t}$)

_Remark: This shows that our algorithm is on-policy, online._

This part gives a rollout pool of $N_{traj}\times H$ decision-points:

\[
\left\{
\left(
s_{t,k}^{(n)},
z_{t,k}^{(n)},
a_{t,k}^{(n)},
r_{t,k}^{(n)},
\ldots
\right)
:\;
n=1,\ldots,N_{traj},\;
k=0,\ldots,H-1
\right\}.
\]

Then we choose $N_t$ points $x_{t,i} = (s_{t,k(i)}^{n(i)}, z_{t,k(i)}^{n(i)}),\; i=1,\ldots, N_t$ from this set.

- Training budget $T_{actor}$

**Pullback layer.**

- Pullback metric batch size $M_t = fN_t$ ($f$ is metric fraction)
- Damping parameter: $\lambda_t = \frac{\lambda_0}{d_a}$

**LSQR solver layer.**

- LSQR solving budget $K_{LSQR}$, solution accuracy $\epsilon_{LSQR}.$

**Policy learning layer.**

- Actor learning rate $\eta_t$
